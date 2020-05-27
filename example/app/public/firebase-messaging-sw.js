// import firebase scripts inside service worker js script
importScripts('https://www.gstatic.com/firebasejs/7.14.5/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/7.14.5/firebase-messaging.js')

// This worker is being registerd by the Web component in Activitree Meteor Push - Client

firebase.initializeApp({
  projectId: 'xxxxx',
  apiKey: 'xxxxxx',
  appId: 'xxxxxxx',
  messagingSenderId: 'xxxxxxxxxx'
}) // get this from your Firebase project

const messaging = firebase.messaging()

self.addEventListener('notificationclick', event => {
  if (event.action) {
    clients.openWindow(event.action)
  }
  event.notification.close()
})
