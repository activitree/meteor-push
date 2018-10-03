/* globals Package, Npm, Cordova */
Package.describe({
  name: 'activitree:meteor-push-notifications',
  version: '3.3.2',
  summary: 'Push notifications for APN and Firebase Admin (FCM)',
  git: 'https://github.com/activitree/meteor-push-notifications.git'
})

Npm.depends({
  'apn': '3.0.0-alpha1',
  'firebase-admin': '6.0.0'
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
    'raix:eventstate@0.0.2',
    'check',
    'mongo',
    'ejson',
    'random'
  ], ['client', 'server'])

  api.use('mongo', 'server')

  // API
  api.addFiles('lib/client/cordova.js', ['web.cordova'])
  api.addFiles(['lib/common/notifications.js'], ['web.cordova', 'server'])

  // API's
  api.addFiles('lib/server/push.api.js', 'server')
  api.addFiles('lib/server/server.js', 'server')
  api.addFiles('lib/server/note_constructor.js', 'server')

  api.mainModule('main.js')
  api.export('Push')
  api.export('CordovaPush')

  // api.export('_matchToken', { testOnly: true })
  // api.export('checkClientSecurity', { testOnly: true })
  // api.export('initPushUpdates', { testOnly: true })
  // api.export('_replaceToken', { testOnly: true })
  // api.export('_removeToken', { testOnly: true })
})
