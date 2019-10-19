/* globals Npm */
import { Meteor } from 'meteor/meteor'
import { Push } from './push'
import { sendApn, sendAndroid, sendWeb } from './note_constructor'

Push.setBadge = function (/* id, count */) { /* throw new Error('Push.setBadge not implemented on the server' */ }

let isConfigured = false

const sendWorker = (task, interval) => {
  if (typeof Push.Log === 'function') { Push.Log('Push: Send worker started, using interval:', interval) }
  console.log('Push: Send worker started, using interval: ' + interval)

  return Meteor.setInterval(() => {
    try {
      task()
    } catch (error) {
      if (typeof Push.Log === 'function') { Push.Log('Push: Error while sending:', error.message) }
      console.log('Push: Error while sending: ' + error.message)
    }
  }, interval)
}

Push.Configure = serverConfig => {
  const isDebug = Push.debug

  const self = this

  if (isConfigured) { throw new Error('Push.Configure should not be called more than once!') }

  isConfigured = true
  if (isDebug) { console.log('Push.Configure', serverConfig) }

  /*
   const replaceToken = (currentToken, newToken) => {
   if (isDebug) { console.log('The replace token is called with current token and new token', currentToken, newToken) }
   self.emitState('token', currentToken, newToken)
   }

   const removeToken = token => {
   self.emitState('token', token, null)
   }
   */

  if (serverConfig.apn) {
    if (isDebug) { console.log('Push: APN configured') }
    if (!serverConfig.apn.production) { console.warn('WARNING: Push APN is set for development (will use the APN development gateway)') }
    if (!serverConfig.apn.token.key) { console.error('ERROR: Push server could not find key') }
    if (!serverConfig.apn.token.keyId) { console.error('ERROR: Push server could not find keyId') }
    if (!serverConfig.apn.token.teamId) { console.error('ERROR: Push server could not find teamId') }

    // Rig apn connection
    const apn = Npm.require('apn')
    const apnConnection = new apn.Provider(serverConfig.apn)
    self.sendAPN = (userToken, mongoNote) => sendApn(isDebug, apn, apnConnection, serverConfig.defaults, userToken, mongoNote)
  }

  if (serverConfig.android) {
    if (isDebug) { console.log('Firebase Admin for Android Messaging configured') }
    if (!serverConfig.android.serviceAccountData) { console.error('ERROR: Push server could not find Android serviceAccountData information') }
    if (!serverConfig.android.databaseURL) { console.error('ERROR: Push server could not find databaseURL information') }

    // Rig Android connection
    const admin = require('firebase-admin')
    const android = admin.initializeApp({
      credential: admin.credential.cert(serverConfig.android && serverConfig.android.serviceAccountData),
      databaseURL: serverConfig.android && serverConfig.android.databaseURL
    })
    const androidConnections = android.messaging() // FCM with Firebase Admin

    self.sendAndroid = (userTokens, mongoNote) => sendAndroid(isDebug, androidConnections, serverConfig.defaults, userTokens, mongoNote)
  }

  if (serverConfig.web) {
    if (isDebug) { console.log('Firebase Admin fro Web Messaging configured') }
    if (!serverConfig.android.serviceAccountData) { console.error('ERROR: Push server could not find FCM serviceAccountData information') }
    if (!serverConfig.android.databaseURL) { console.error('ERROR: Push server could not find FCM databaseURL information') }

    // Rig Android connection
    const admin = require('firebase-admin')
    const android = admin.initializeApp({
      credential: admin.credential.cert(serverConfig.android && serverConfig.android.serviceAccountData),
      databaseURL: serverConfig.android && serverConfig.android.databaseURL
    })
    const androidConnections = android.messaging() // FCM with Firebase Admin

    // self.sendWeb = (userTokens, mongoNote) => sendWeb(isDebug, androidConnections, serverConfig.defaults, userTokens, mongoNote)
  }

  /**
   * 'querySend' functions distributes the notifications to be send with the right
   * providers based on the tokens they are send to
   */
  let querySend = (query, mongoNote) => {
    const countApn = []
    const countAndroid = []
    Push.appCollection.find(query).forEach(app => {
      if (isDebug) { console.log('send to token', app.token) }

      if (app.token.apn) {
        countApn.push(app._id)
        if (self.sendAPN) { self.sendAPN(app.token.apn, mongoNote) }
      } else if (app.token.android) {
        countAndroid.push(app._id)
        if (self.sendAndroid) {
          self.sendAndroid(app.token.android, mongoNote)
        }
      } else {
        throw new Error('Push.send got a faulty query')
      }
    })

    if (isDebug) {
      console.log('Push: Sent message "' + mongoNote.title + '" to ' + countApn.length + ' ios apps ' + countAndroid.length + ' android apps')

      // Add some verbosity about the send result, making sure the developer
      // understands what just happened.
      if (!countApn.length && !countAndroid.length) {
        if (!Push.appCollection.findOne()) {
          console.log('Push, GUIDE: The "Push.appCollection" is empty -' +
            ' No clients have registred on the server yet...')
        }
      } else if (!countApn.length) {
        if (!Push.appCollection.findOne({'token.apn': { $exists: true }})) {
          console.log('Push, GUIDE: The "Push.appCollection" - No APN clients have registred on the server yet...')
        }
      } else if (!countAndroid.length) {
        if (!Push.appCollection.findOne({'token.android': { $exists: true }})) {
          console.log('Push, GUIDE: The "Push.appCollection" - No ANDROID clients have registered on the server yet...')
        }
      }
    }

    return {
      apn: countApn,
      fcm: countAndroid
    }
  }

  /**
   *Constructs a query and passed it as parameter on 'querySend' function
   * mongoNote = the gross notification saved into Mongo, before serialization for the two Providers, APN and Android
   */
  self.serverSend = mongoNote => {
    let query
    // set some minimum requirements for a notification to be eligible for sending.
    if (mongoNote.title !== '' + mongoNote.title) { throw new Error('Push.send: option "title" not a string') }
    if (mongoNote.body !== '' + mongoNote.body) { throw new Error('Push.send: option "text" not a string') }

    if (mongoNote.token || mongoNote.tokens) {
      const tokenList = mongoNote.token ? [mongoNote.token] : mongoNote.tokens
      if (isDebug) { console.log('Push: Send message "' + mongoNote.title + '" via token(s)', tokenList) }
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
                  { 'token.android': { $exists: true } }
                ]
              },
              { enabled: { $ne: false } }
            ]
          }
        ]
      }
    } else if (mongoNote.userId) {
      if (isDebug) { console.log('Push: Send message "' + mongoNote.title + '" to user: ', mongoNote.userId) }
      query = {
        $and: [
          { userId: mongoNote.userId },
          {
            $or: [
              { 'token.apn': { $exists: true } },
              { 'token.android': { $exists: true } }
            ]
          },
          { enabled: { $ne: false } }
        ]
      }
    }

    if (query) {
      return querySend(query, mongoNote)
    } else {
      throw new Error('Push.send: please set option "token"/"tokens" or "query"')
    }
  }

  let isSendingNotification = false

  if (serverConfig.defaults && serverConfig.defaults.sendInterval !== null) {
    // This will require index since we sort notifications by createdAt
    Push.notifications._ensureIndex({ createdAt: 1 })
    Push.notifications._ensureIndex({ sent: 1 })
    Push.notifications._ensureIndex({ sending: 1 })
    Push.notifications._ensureIndex({ delayUntil: 1 })

    let sendNotification = mongoNote => {
      // Reserve notification
      let now = Date.now()
      let timeoutAt = now + serverConfig.defaults && serverConfig.defaults.sendTimeout
      let reserved = Push.notifications.update({
        _id: mongoNote._id,
        sent: false, // xxx: need to make sure this is set on create
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

        pendingNotifications.forEach(mongoNote => {
          // console.log('this is the pending notification: ', mongoNote)

          try {
            sendNotification(mongoNote)
          } catch (error) {
            if (typeof Push.Log === 'function') {
              Push.Log('Push: Could not send notification id: "' + mongoNote._id + '", Error:', error.message)
            }
            if (isDebug) {
              console.log('show full error', error)
              console.log('Push: Could not send notification id: "' + mongoNote._id + '", Error: ' + error.message)
            }
          }
        })
      } finally {
        isSendingNotification = false
      }
    }, (serverConfig.defaults && serverConfig.defaults.sendInterval) || 15000)
  } else {
    if (isDebug) { console.log('Push: Send server is disabled') }
  }
}
