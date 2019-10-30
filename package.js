/* globals Package, Npm, Cordova */
Package.describe({
  name: 'activitree:push',
  version: '2.0.4',
  summary: 'Push notifications for APN and Firebase (FCM) (with web-push)',
  git: 'https://github.com/activitree/meteor-push.git'
})

Npm.depends({
  'firebase-admin': '8.6.1',
  firebase: '7.2.1'
})

Cordova.depends({
  'phonegap-plugin-push': '2.3.0',
  'cordova-plugin-device': '2.0.3'
})

Package.onUse(api => {
  api.versionsFrom('1.8')
  api.use(['ecmascript'])

  api.use(['tracker'], ['web.browser', 'web.cordova'])
  api.use(['accounts-base'], ['web.browser', 'web.cordova', 'server'], { weak: true })

  api.use([
    'ecmascript',
    'check',
    'mongo',
    'ejson',
    'random',
    'raix:eventstate@0.0.5',
  ], ['client', 'server'])

  api.use('mongo', 'server')

  // API's
  api.addFiles('lib/server/pushToDevice.js', 'server')
  api.addFiles('lib/server/internalMethods.js', 'server')

  api.mainModule('lib/client/cordova.js', ['web.cordova'])
  api.mainModule('lib/client/web.js', ['web.browser'])
  api.mainModule('lib/server/pushToDB.js', ['server'])
})
