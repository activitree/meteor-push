/* globals Mongo, Random */

import { Match, check } from "meteor/check";
import { Push } from "./pushToDB";
import { Meteor } from "meteor/meteor";

Push.appCollection = new Mongo.Collection("_push_app_tokens");
Push.appCollection.createIndex({ userId: 1 });

const matchToken = Match.OneOf(
  { web: String },
  { android: String },
  { apn: String },
  { ios: String }
);

Meteor.methods({
  "push-update": async function (options) {
    if (Push.debug) {
      console.log("Push: Got push token from app:", options);
    }

    check(options, {
      id: Match.Optional(String),
      token: matchToken,
      appName: String,
      userId: Match.OneOf(String, null),
      metadata: Match.Optional(Object),
    });

    // The if user id is set then user id should match on client and connection
    if (options.userId && options.userId !== this.userId) {
      throw new Meteor.Error(403, "Forbidden access");
    }

    let doc;

    if (options.userId) {
      doc = await Push.appCollection.findOneAsync({ userId: options.userId });
    }

    // No doc was found - we check the database to see if
    // we can find a match for the app via token and appName
    if (!doc) {
      doc = await Push.appCollection.findOneAsync({
        $and: [
          { token: options.token }, // Match token
          { appName: options.appName }, // Match appName
          { token: { $exists: true } }, // Make sure token exists
        ],
      });
    }

    // if we could not find the id or token then create it
    if (!doc) {
      doc = {
        token: options.token,
        appName: options.appName,
        userId: options.userId,
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      doc._id = Random.id();
      try {
        const res = await Push.appCollection.insertAsync(doc);
        if (Push.debug) {
          console.log(
            "Successfully inserted something in the Push.appCollection and saved to local storage",
            res
          );
        }
      } catch (err) {
        if (Push.debug) {
          console.log(
            "I have an error when inserting something int he appCollection, server.js, line 60:",
            err
          );
        }
      }
    } else {
      try {
        const res = await Push.appCollection.updateAsync(
          { _id: doc._id },
          {
            $set: {
              updatedAt: Date.now(),
              token: options.token,
            },
          }
        );
        if (Push.debug) {
          console.log(
            "Successfully updated something in the Push.appCollection",
            res
          );
        }
      } catch (err) {
        if (Push.debug) {
          console.log(
            "I have an error when updating something int he appCollection, server.js, line 73:",
            err
          );
        }
      }
    }

    let removed = false;
    if (doc) {
      try {
        const res = await Push.appCollection.removeAsync({
          $and: [
            { _id: { $ne: doc._id } },
            { token: doc.token },
            { appName: doc.appName },
            { token: { $exists: true } },
          ],
        });
        if (Push.debug) {
          console.log("Push: Removed " + res + " existing app items");
        }
        if (res > 0) {
          removed = true;
        }
      } catch (err) {
        console.log(
          "I have an error when deleting something int he appCollection, server.js, line 90:",
          err
        );
      }
    }

    if (!doc) {
      throw new Meteor.Error(500, "setPushToken could not create record");
    }
    // Return the doc we want to use
    return { doc, removed };
  },

  "push-setuser": async function (pushTokenDBId) {
    if (!pushTokenDBId) {
      if (Push.debug) {
        console.log(
          "Push: I am probably after an App update where I installed a new version of the App" +
            "and I cleared the local store but I am still logged when I start the new version for the first time." +
            "I will skip a user update in this situation."
        );
      }
      return;
    }
    check(pushTokenDBId, String);
    if (Push.debug) {
      console.log(
        'Push: Settings userId "' + this.userId + '" for app:',
        pushTokenDBId
      );
    }
    try {
      const found = await Push.appCollection.updateAsync(
        { _id: pushTokenDBId },
        { $set: { userId: this.userId } }
      );
      if (Push.debug) {
        console.log(
          "Successfully updated the FOUND in the Push.appCollection",
          res
        );
      }

      return !!found;
    } catch (err) {
      console.log(
        "I have an error when updating the FOUND  the appCollection, server.js, line 120:",
        err
      );
    }
  },

  "push-metadata": async function (data) {
    check(data, {
      id: String,
      metadata: Object,
    });

    // Set the metadata
    const found = await Push.appCollection.updateAsync(
      { _id: data.id },
      { $set: { metadata: data.metadata } }
    );

    return !!found;
  },

  "push-enable": async function (data) {
    check(data, {
      id: String,
      enabled: Boolean,
    });

    if (Push.debug) {
      console.log(
        'Push: Setting enabled to "' + data.enabled + '" for app:',
        data.id
      );
    }

    const found = await Push.appCollection.updateAsync(
      { _id: data.id },
      { $set: { enabled: data.enabled } }
    );

    return !!found;
  },

  "push-check-is-enabled": async function (data) {
    check(data, {
      id: String,
      enabled: Boolean,
    });

    if (Push.debug) {
      console.log(
        'Push: Setting enabled to "' + data.enabled + '" for app:',
        data.id
      );
    }

    const found = await Push.appCollection.findOneAsync(
      { _id: data.id, enabled: { $exists: true } },
      { fields: { enabled: 1 } }
    );

    return found && found.enabled;
  },

  "push-unsub-webpush": async function (pushTokenId) {
    check(pushTokenId, String);
    return await Push.appCollection.removeAsync({ _id: pushTokenId });
  },
});
