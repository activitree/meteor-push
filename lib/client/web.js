const admin = require('firebase-admin')

const android = admin.initializeApp({
  credential: admin.credential.cert(serverConfig.android && serverConfig.android.serviceAccountData),
  databaseURL: serverConfig.android && serverConfig.android.databaseURL
})

const config = {
  messagingSenderId: '<your-app-messaging-sender-id>'
};

firebase.initializeApp(config);

let messaging;

// we need to check if messaging is supported by the browser
if(firebase.messaging.isSupported()) {
  messaging = firebase.messaging();
}

export {
  messaging
};


const admin = require('firebase-admin')
const android = admin.initializeApp({
  credential: admin.credential.cert(serverConfig.android && serverConfig.android.serviceAccountData),
  databaseURL: serverConfig.android && serverConfig.android.databaseURL
})
const androidConnections = android.messaging() // FCM with Firebase Admin

// self.sendWeb = (userTokens, mongoNote) => sendWeb(isDebug, androidConnections, serverConfig.defaults, userTokens, mongoNote)