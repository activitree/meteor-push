/* globals Assets */
import { Push } from 'meteor/activitree:push'
// the following folder/location of your choice. It contains your android Firebase-Admin config file.
import { serviceAccountData } from '/server/private/serviceAccount'

Push.debug = true // Turns on various console messages in the Server console.

Push.Configure({
  // appName: 'Activitree',
  firebaseAdmin: {
    serviceAccountData,
    databaseURL: '____firebase_database_url____'
  },
  defaults: {
    // ******** Meteor Push Messaging Processor *******
    sendBatchSize: 5,          // Configurable number of notifications to send per batch
    sendInterval: 3000,
    keepNotifications: false,  // the following keeps the notifications in the DB
    delayUntil: null,          // Date
    sendTimeout: 60000,        // milliseconds 60 x 1000 = 1 min

    // ******** Global Message *******
    appName: 'AppName',        // Serve it as a 'from' default for IOS notifications
    sound: 'note',             // String (file has to exist in app/src/res/... or default on the mobile will be used). For Android no extension, for IOS add '.caf'
    data: null,                // Global Data object - applies to all vendors if specific vendor data object does not exist.
    imageUrl: 'https://a_default_image_url.jpg',
    badge: 1,                  // Integer
    vibrate: 1,                // Boolean // TODO see if I really use this.
    requireInteraction: false, // TODO Implement this and move it to where it belongs
    action: 'https://some_photo_url_or_link_to_something', // Android, WebPush - on notification click follows this URL
    analyticsLabel: 'activitreeSomething',   // Android, IOS: Label associated with the message's analytics data.

    // ******* IOS Specifics ******
    apnsPriority: '10',
    topic: 'com.activitree',   // String = the IOS App id
    launchImage: '',           // IOS: String
    iosData: null,             // Data object targeted to the IOS notification
    // category: null,         // IOS: IOS - not in user

    // ******* Android Specifics *******
    icon: 'statusbaricon',     // String (name of icon for Android has to exist in app/src/res/....)
    color: '#337FAE',          // String e.g 3 rrggbb
    ttl: '86400s',             // if not set, use default max of 4 weeks
    priority: 'HIGH',          // Android: one of NORMAL or HIGH
    notificationPriority: 'PRIORITY_DEFAULT', // Android: one of none, or PRIORITY_MIN, PRIORITY_LOW, PRIORITY_DEFAULT, PRIORITY_HIGH, PRIORITY_MAX
    collapseKey: 1,            // String/ Integer??, Android:  A maximum of 4 different collapse keys is allowed at any given time.
    androidData: null,           // Data object targeted to the Android notification
    visibility: 'PRIVATE', // Android: One of 'PRIVATE', 'PUBLIC', 'SECRET'. Default is 'PRIVATE',
    // silent: false,             // Not implemented
    // sticky: false,             // Not implemented
    // localOnly: false,          // Not implemented: Some notifications can be bridged to other devices for remote display, such as a Wear OS watch.
    // defaultSound: false,       // Not implemented: If set to true, use the Android framework's default sound for the notification.
    // defaultVibrateTimings: false, // Not implemented: If set to true, use the Android framework's default vibrate pattern for the notification.
    // defaultLightSettings: true, // Not implemented: If set to true, use the Android framework's default LED light settings for the notification.
    // vibrateTimings: ['3.5s'],  // Not implemented: Set the vibration pattern to use.

    // ******* Web Specifics *******
    webIcon: 'https://link_to_your_logo.jpg',
    webData: null,                 // Data object targeted to the Web notification
    webTTL: `${3600 * 1000}`       // Number of seconds as a string
  }
})
