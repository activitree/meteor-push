import { Meteor } from 'meteor/meteor'
import { Push } from './pushToDB'
import { sendNotification } from './notification'

Push.setBadge = function (/* id, count */) { /* throw new Error('Push.setBadge not implemented on the server' */ }

let isConfigured = false

const sendWorker = (task, interval, isDebug) => {
  if (isDebug) {
    console.log('Push: Send worker started, using interval: ' + interval)
  }

  return Meteor.setInterval(() => {
    try {
      task()
    } catch (error) {
      if (isDebug) {
        console.log('Push: Error while sending:', error.message)
      }
    }
  }, interval)
}

Push.Configure = serverConfig => {
  const isDebug = Push.debug
  const self = this
  if (isConfigured) { throw new Error('Push.Configure should not be called more than once!') }
  isConfigured = true
  if (isDebug) { console.log('Push.Configure', serverConfig) }

  // Rig FCM connection
  const admin = require('firebase-admin')
  const fcm = admin.initializeApp({
    credential: admin.credential.cert(serverConfig.firebaseAdmin && serverConfig.firebaseAdmin.serviceAccountData),
    databaseURL: serverConfig.firebaseAdmin && serverConfig.firebaseAdmin.databaseURL
  })

  const fcmConnections = fcm.messaging() // FCM with Firebase Admin
  if (serverConfig.firebaseAdmin) {
    if (isDebug) { console.log('Firebase Admin for Android Messaging configured') }
    if (!serverConfig.firebaseAdmin.serviceAccountData) { console.error('ERROR: Push server could not find Android serviceAccountData information') }
    if (!serverConfig.firebaseAdmin.databaseURL) { console.error('ERROR: Push server could not find databaseURL information') }
    self.sendNotification = (userTokens, mongoNote) => sendNotification(isDebug, fcmConnections, serverConfig.defaults, userTokens, mongoNote)
  }

  /**
   * 'querySend' functions distributes the notifications to be send with the right
   * providers based on the tokens they are send to
   */
  const querySend = (query, mongoNote) => {
    const countApn = []
    const countAndroid = []
    const countWeb = []

    Push.appCollection.find(query).map(app => {
      if (isDebug) {
        console.log('Send to token', app.token)
        if (app.token.apn) { countApn.push('x') }
        if (app.token.android) { countAndroid.push('x') }
        if (app.token.web) { countWeb.push('x') }
      }
      self.sendNotification(app.token.apn || app.token.android || app.token.web, mongoNote)
    })

    if (isDebug) {
      console.log('Push: Sent message "' + mongoNote.title + '" to ' + countApn.length + ' ios apps | ' + countAndroid.length + ' android apps | ', countWeb.length, ' web apps')
      // Add some verbosity about the send result, making sure the developer
      // understands what just happened.
      if (!countApn.length && !countAndroid.length && !countWeb.length) {
        if (!Push.appCollection.findOne()) {
          console.log('Push, GUIDE: The "Push.appCollection" might be empty. No clients have registered on the server yet...')
        }
      } else if (!countApn.length) {
        if (!Push.appCollection.findOne({ 'token.apn': { $exists: true } })) {
          console.log('Push, GUIDE: The "Push.appCollection" - No APN clients have registred on the server yet...')
        }
      } else if (!countAndroid.length) {
        if (!Push.appCollection.findOne({ 'token.android': { $exists: true } })) {
          console.log('Push, GUIDE: The "Push.appCollection" - No ANDROID clients have registered on the server yet...')
        }
      } else if (!countWeb.length) {
        if (!Push.appCollection.findOne({ 'token.web': { $exists: true } })) {
          console.log('Push, GUIDE: The "Push.appCollection" - No Web clients have registered on the server yet...')
        }
      }
    }

    return {
      apn: countApn,
      fcm: countAndroid,
      wen: countWeb
    }
  }

  /**
   *Constructs a query and passed it as parameter on 'querySend' function
   * mongoNote = the gross notification saved into Mongo, before serialization for the two Providers, APN and Android
   */
  self.serverSend = mongoNote => {
    let query
    // set some minimum requirements for a notification to be eligible for sending.
    // TODO implement some checking for data. Perhaps not right here but once implemented remove the next 2 lines
    if (mongoNote.title !== '' + mongoNote.title) { throw new Error('Push.send: option "title" not a string') }
    if (mongoNote.body !== '' + mongoNote.body) { throw new Error('Push.send: option "text" not a string') }

    if (mongoNote.token || mongoNote.tokens) {
      const tokenList = mongoNote.token ? [mongoNote.token] : mongoNote.tokens
      if (isDebug) { console.log('Push: Send message "' + mongoNote.title + '" via token(s)', tokenList) }
      query = {
        token: { $in: tokenList },
        enabled: { $ne: false }
      }
    } else if (mongoNote.tokenId || mongoNote.tokenIds) {
      const tokenIdsList = mongoNote.tokenId ? [mongoNote.tokenId] : mongoNote.tokenIds
      if (isDebug) { console.log('Push: Send message "' + mongoNote.title + '" via token Id(s)', tokenIdsList) }
      query = {
        _id: { $in: tokenIdsList },
        enabled: { $ne: false }
      }
      /*
      query = {
        $or: [
          {
            $and: [
              { token: { $in: tokenList } },
              { enabled: { $ne: false } }
            ]
          },
          {
            $and: [
              { _id: { $in: tokenList } },
              {
                $or: [
                  { 'token.apn': { $exists: true } },
                  { 'token.android': { $exists: true } },
                  { 'token.web': { $exists: true } }
                ]
              },
              { enabled: { $ne: false } }
            ]
          }
        ]
      }
       */
    } else if (mongoNote.userId || mongoNote.userIds) {
      const userIdsList = mongoNote.userId ? [mongoNote.userId] : mongoNote.userIds
      if (isDebug) { console.log('Push: Send message "' + mongoNote.title + '" to user: ', userIdsList) }
      query = {
        userId: { $in: userIdsList },
        enabled: { $ne: false }
      }
      /*
      query = {
        $and: [
          { userId: mongoNote.userId },
          {
            $or: [
              { 'token.apn': { $exists: true } },
              { 'token.android': { $exists: true } },
              { 'token.web': { $exists: true } }
            ]
          },
          { enabled: { $ne: false } }
        ]
      }
       */
    }
    if (query) {
      return querySend(query, mongoNote)
    } else {
      if (isDebug) { throw new Error('Push.send: please set option token/tokens, tokenId/tokenIds, userId/userIds') }
    }
  }

  let isSendingNotification = false

  if (serverConfig.defaults && serverConfig.defaults.sendInterval !== null) {
    const sendNotification = mongoNote => {
      // Reserve notification
      const now = Date.now()
      const timeoutAt = now + serverConfig.defaults && serverConfig.defaults.sendTimeout
      const reserved = Push.notifications.update({
        _id: mongoNote._id,
        sent: false,
        sending: { $lt: now }
      }, {
        $set: {
          sending: timeoutAt
        }
      })

      // Make sure we only handle notifications reserved by this instance
      if (reserved) {
        const result = self.serverSend(mongoNote)
        if (!(serverConfig.defaults && serverConfig.defaults.keepNotifications)) {
          Push.notifications.remove({ _id: mongoNote._id })
        } else {
          Push.notifications.update({ _id: mongoNote._id }, {
            $set: {
              sent: true,
              sentAt: Date.now(),
              count: result,
              sending: 0
            }
          })
        }
        // Not sure what is this next one for. In my environment self.emit ... is not a function.
        // self.emit('send', { notification: notification._id, result: result })
      }
    }

    sendWorker(() => {
      if (isSendingNotification) { return }
      try {
        isSendingNotification = true
        const batchSize = (serverConfig.defaults && serverConfig.defaults.sendBatchSize) || 1
        const now = Date.now()
        const pendingNotifications = Push.notifications.find({
          $and: [
            { sent: false },
            { sending: { $lt: now } },
            {
              $or: [
                { delayUntil: { $exists: false } },
                { delayUntil: { $lte: now } }
              ]
            }
          ]
        }, {
          sort: { createdAt: 1 },
          limit: batchSize
        })

        pendingNotifications.map(mongoNote => {
          try {
            sendNotification(mongoNote)
          } catch (error) {
            if (isDebug) {
              console.log('Show Full error', error)
              console.log('Push: Could not send notification id: "' + mongoNote._id + '", Error: ' + error.message)
            }
          }
        })
      } finally {
        isSendingNotification = false
      }
    }, (serverConfig.defaults && serverConfig.defaults.sendInterval) || 15000, isDebug)
  } else {
    if (isDebug) { console.log('Push: Send server is disabled') }
  }
}
