/* globals Package, Npm, Cordova */
Package.describe({
  name: 'activitree:push',
  version: '3.0.0-beta.0',
  summary: 'Push Notifications for Cordova and Web/PWA with Firebase (FCM).',
  git: 'https://github.com/activitree/meteor-push.git'
})

Npm.depends({
  'firebase-admin': '11.11.0',
  firebase: '10.4.0',
  events: '3.3.0'
})

Cordova.depends({
  '@havesource/cordova-plugin-push': 'https://github.com/havesource/cordova-plugin-push.git#86b52a7769fe80e975752f2d2db5b1abeb194802', // for IOS with SDK > 8.1.1
  // '@havesource/cordova-plugin-push': '3.0.1', // for Android with SDK <=21.+
  'cordova-plugin-device': '2.1.0'
})

Package.onUse(api => {
  api.versionsFrom(['2.14', '3.0-beta.0'])
  api.use(['tracker', 'ecmascript', 'ejson'], 'client')
  // api.use(['accounts-base'], ['client', 'server'], { weak: true })

  api.use(['ecmascript', 'check', 'mongo'], 'server')

  // API's
  api.addFiles('lib/server/pushToDevice.js', 'server')
  api.addFiles('lib/server/internalMethods.js', 'server')

  api.mainModule('lib/client/cordova.js', ['web.cordova'])
  api.mainModule('lib/client/web.js', ['web.browser'])
  api.mainModule('lib/server/pushToDB.js', ['server'])
})
