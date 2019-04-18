/* globals Package, Npm, Cordova */
Package.describe({
  name: 'activitree:push',
  version: '1.0.1',
  summary: 'Push notifications for APN and Firebase Admin (FCM)',
  git: 'https://github.com/activitree/meteor-push.git'
})

Npm.depends({
  'apn': '3.0.0-alpha1',
  'firebase-admin': '7.3.0'
})

Cordova.depends({
  'phonegap-plugin-push': '2.2.3',
  'cordova-plugin-device': '2.0.2'
})

Package.onUse(api => {
  api.versionsFrom('1.6')
  api.use(['ecmascript'])

  api.use(['tracker'], 'web.cordova')
  api.use(['accounts-base'], ['web.cordova', 'server'], { weak: true })

  api.use([
    'raix:eventstate@0.0.5',
    'check',
    'mongo',
    'ejson',
    'random'
  ], ['client', 'server'])

  api.use('mongo', 'server')

  // API's
  api.addFiles('lib/server/push.api.js', 'server')
  api.addFiles('lib/server/server.js', 'server')

  api.mainModule('lib/client/cordova.js', ['web.cordova'])
  api.mainModule('lib/server/push.js', ['server'])
})
