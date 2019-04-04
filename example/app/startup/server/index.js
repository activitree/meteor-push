/* globals Assets */
import { Push } from 'meteor/activitree:push'
// the following folder/location is your choice. It contains your android Firebase-Admin config file.
import { serviceAccountData } from '/server/private/serviceAccount'

Push.debug = false

Push.Configure({
  appName: 'YourAppName',
  apn: {
    token: {
      key: Assets.getText('apns.p8'), // Apple generated - check documentation
      keyId: 'xxxxxxx', // Key Id provided at the time of P8 creation
      teamId: 'your_apple_team_id'
    },
    production: true
  },
  android: { // we name this android same as in Firebase Admin because FCM can now be generic for both IOS and Android
    serviceAccountData,
    databaseURL: 'https://your_database-code.firebaseio.com'
  },
  defaults: {
    appName: 'YourAppName',   // Serve it as a 'from' default for IOS notifications
    topic: 'com.IOS_APP_ID',  // String = the IOS App id
    sound: 'note',            // String (file has to exist in app/src/res/... or default on the mobile will be used). For Android no extension, for IOS add '.caf'
    icon: 'statusbaricon',    // String (name of icon for Android has to exist in app/src/res/....)
    color: '#337FAE',         // String e.g #rrggbb . Android requires an alpha PNG white icon on this color background
    launchImage: null,        // String
    category: null,           // String IOS
    delayUntil: null,         // Date
    badge: 1,                 // Integer
    vibrate: true,            // boolean
    sendInterval: 3000,
    sendTimeout: 60000,        // milliseconds 60 x 1000 = 1 min
    ttl: 3600 * 1000,          // milliseconds for Android
    priority: 'high',          // String out of 2 values, Android
    collapseKey: 1,            // String/ Integer??, Android:  A maximum of 4 different collapse keys is allowed at any given time.
    // 'sendBatchSize': 1, Configurable number of notifications to send per batch
    // the following keeps the notifications in the Mongo DB
    keepNotifications: false
  }
})

// TODO Redo / Rethink the allowance

Push.allow({
  send: (userId, notification) => {
    return true
  }
})
