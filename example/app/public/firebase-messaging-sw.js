// import firebase scripts inside service worker js script
importScripts('https://www.gstatic.com/firebasejs/7.2.2/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.2.2/firebase-messaging.js')

// This worker is being registerd by the Web component in Activitree Meteor Push - Client

firebase.initializeApp({ messagingSenderId: 'xxxxxxxx' }) // get this from your Firebase project

const messaging = firebase.messaging()

self.addEventListener('notificationclick', event => {
  if (event.action) {
    clients.openWindow(event.action)
  }
  event.notification.close()
})
