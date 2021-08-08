// import firebase scripts inside service worker js script
if (firebase && firebase.messaging && firebase.messaging.isSupported()) {
  importScripts('https://www.gstatic.com/firebasejs/8.9.0/firebase-app.js')
  importScripts('https://www.gstatic.com/firebasejs/8.9.0/firebase-messaging.js')

// This worker is being registerd by the Web component in Activitree Meteor Push - Client

  firebase.initializeApp({
    apiKey: 'xxxxxxx',
    authDomain: 'xxxxxxx',
    projectId: 'xxxxxxx',
    storageBucket: 'xxxxxxx',
    messagingSenderId: 'xxxxxxx',
    appId: 'xxxxxxx',
    measurementId: 'xxxxxxx',
  }) // get this from your Firebase project

   const messaging = firebase.messaging()

    /*
    Debug: printout a received notification in console.
    messaging.onBackgroundMessage(payload => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload)
      // Customize notification here
      const notificationTitle = payload.notification.title
      const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        image: payload.notification.image,
        action: payload.notification.click_action || payload.fcmOptions.link
      }

      self.registration.showNotification(notificationTitle, notificationOptions)
    })
   */
}

self.addEventListener('notificationclick', event => {
  if (event.action) {
    clients.openWindow(event.action)
  }
  event.notification.close()
})
