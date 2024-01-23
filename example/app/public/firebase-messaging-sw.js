/* globals importScripts, firebase */
/* eslint-env worker */
/* eslint-env serviceworker */
importScripts('https://www.gstatic.com/firebasejs/9.9.4/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.9.4/firebase-messaging-compat.js')

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const link = event.notification?.data?.FCM_MSG?.notification?.click_action
  event.waitUntil(
    clients.matchAll({ type: 'window' })
    .then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(link)
      }
    })
    // clients.openWindow(`${self.location.origin}${action}`);
  )
  console.log('From click_action', { link })
})

if (firebase?.messaging?.isSupported()) {
  firebase.initializeApp({
    apiKey: 'xxxxxxx',
    authDomain: 'xxxxxxx',
    projectId: 'xxxxxxx',
    storageBucket: 'xxxxxxx',
    messagingSenderId: 'xxxxxxx',
    appId: 'xxxxxxx',
    // measurementId: 'xxxxxxx',
  }) // get this from your Firebase project
  const messaging = firebase.messaging()
}
