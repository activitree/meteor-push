// Push Methods. Perhaps this could be part of the package itself
// This method is the generalized method for both Client and Server. In the client folder you can find an example of
// how this method is being called.

import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Push } from 'meteor/activitree:push'
import SimpleSchema from 'simpl-schema'

export const userPushNotification = new ValidatedMethod({
  name: 'userPushNotification',
  validate: new SimpleSchema({
    title: String,
    body: String,
    imageUrl: { type: String, optional: true },
    badge: { type: Number, optional: true },
    userId: { type: String, optional: true },
    userIds: { type: Array, optional: true },
    'userIds.$': String,
    topic: { type: String, optional: true },
    sound: { type: String, optional: true },
    icon: { type: String, optional: true },
    color: { type: String, optional: true },
    vibrate: { type: Boolean, optional: true },
    contentAvailable: { type: Boolean, optional: true },
    launchImage: { type: String, optional: true },
    category: { type: String, optional: true },
    threadId: { type: String, optional: true },
    delayUntil: { type: Date, optional: true },
    token: { type: Object, blackbox: true, optional: true },
    tokens: { type: Array, optional: true },
    'tokens.$': { type: Object, blackbox: true, optional: true },
    tokenId: { type: String, optional: true },
    tokenIds: { type: Array, optional: true },
    'tokenIds.$': String,
    from: { type: String, optional: true },
    data: { type: Object, blackbox: true, optional: true },
    iosData: { type: Object, blackbox: true, optional: true },
    androidData: { type: Object, blackbox: true, optional: true }, // Android data ca only take string values do further validation here
    webData: { type: Object, blackbox: true, optional: true },
    action: { type: String, optional: true }
  }).validator(),
  run (notification) {
    // Add your Method Level security preference here.
    // if (!this.userId) {
    //   throw new Meteor.Error(404, 'No userId was set, userId was ' + userId)
    // }

    // topic in IOS and Android have different behaviors. In IOS it must be set as the app id,
    // in Android a notification can be sent to a topic (to its subscribers)

    // Doing some cleanup on useless keys of the notification object, if any.
    Object.keys(notification).map(key => (notification[key] === null || notification[key] === undefined) && delete notification[key])

    Push.send(notification)
  }
})

// TODO test and further develop.
export const sendPushNotificationBadge = new ValidatedMethod({
  name: 'send.push.notification.badge',
  validate: new SimpleSchema({
    userId: { type: String },
    count: { type: Number }
  }).validator(),
  run ({ userId, count }) {
    Push.send({
      from: 'AppName',
      title: '',
      body: '',
      badge: count,
      userId // or userIds, token, tokenIds ... etc
    })
  }
})

/*
// Not tested
export const removeHistory = new ValidatedMethod({
  name: 'remove.push.notification.history',
  validate: new SimpleSchema({
  }).validator(),
  run () {
    NotificationHistory.remove({}, function (error) {
      if (!error) {
        // console.log('All history removed')
      }
    })
  }
})
*/
