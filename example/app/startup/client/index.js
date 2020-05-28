import { Meteor } from 'meteor/meteor'
import WebPush, { CordovaPush } from 'meteor/activitree:push'

Meteor.startup(() => {
  if (Meteor.isCordova) {
    // Check cordova-push-plugin for all options supported.
    // The configuration object is used to initialize Cordova Push on the device.
    CordovaPush.Configure({
      appName: 'YourAppName',
      debug: true, // Turns on various console messages in the Cordova console.
      android: {
        alert: true,
        badge: true,
        sound: true,
        vibrate: true,
        clearNotifications: true,
        icon: 'statusbaricon',
        iconColor: '#337FAE',
        forceShow: true
        // clearBadge: false,
        // topics: ['messages', 'notifications'],
        // messageKey: 'message',
        // titleKey: 'title'
        // topics: ['messages', 'notifications']
      },
      ios: {
        alert: true,
        badge: true,
        sound: true,
        clearBadge: true,
        topic: 'com.your_app_id' // your IOS app id.
      }
    })
  } else {
    // Perhaps it is best to get this configuration data via Meteor Settings or Environment Variables.
    WebPush.Configure({
      appName: 'Activitree', // required
      debug: true, // Turns on various console messages in the browser console
      firebase: {
        apiKey: '________',
        authDomain: '_______',
        databaseURL: '________________', // not required for Web Push to work
        projectId: '________________',
        storageBucket: '______________', // not required for Web Push to work
        messagingSenderId: '_________________',
        appId: '_______________',
      },
      publicVapidKey: '____________'
    })
  }
})
