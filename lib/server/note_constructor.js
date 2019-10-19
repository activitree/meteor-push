import { Match } from 'meteor/check'
// mongoNotification comes from Mongo, defaults comes from the initializer in Push / client / startup

const sendApn = (isDebug, apn, apnConnection, defaults, userToken, mongoNote) => {
  if (Match.test(mongoNote.apn, Object)) { mongoNote = Object.assign({}, mongoNote, mongoNote.apn) }

  // When you send a mongoNote to a user these things will happen: you emit and event "send", you write the mongoNote to Mongo.
  // The mongoNote in Mongo contains all elements for both APN (IOS or FCM) and FCM for Android.
  // From Mongo a send worker takes the mongoNote from Mongo, we then enhance it with default values and passed it to the right Provider.
  // Below we serialize a "note" with the particularities of the APN for sending to IOS

  let apnNote = new apn.Notification()

  apnNote.body = mongoNote.body
  apnNote.title = mongoNote.title
  apnNote.expiry = Math.floor(Date.now() / 1000) + 3600
  apnNote.badge = mongoNote.badge || defaults.badge || 1
  apnNote.topic = defaults.topic
  apnNote.collapseId = mongoNote.notId
  apnNote.payload.messageFrom = mongoNote.from || defaults.appName
  apnNote.action = mongoNote.action
  apnNote.contentAvailable = 1
  apnNote.sound = mongoNote.sound ? `${mongoNote.sound}.caf` : defaults.sound ? `${defaults.sound}.caf` : '' // For Android no extension, for IOS add '.caf'

  if (isDebug) { console.log('Notification passed to APN', apnNote, 'Gross mongoNote as sent from Meteor:', mongoNote) }

  apnConnection.send(apnNote, userToken)
    .then(response => {
      if (isDebug) { console.log('what is the response?', response) }
      /*
       response.sent.forEach(token => {
       console.log(token)
       // mongoNoteSent(user, token)
       }) */
      response.failed.map(failure => {
        if (failure.error) {
          // A transport-level error occurred (e.g. network problem)
          if (isDebug) { console.log('Huh a failure:', failure, failure.error) }
          // mongoNoteError(user, failure.device, failure.error)
        } else {
          // `failure.status` is the HTTP status code
          // `failure.response` is the JSON payload
          if (isDebug) { console.log(failure.device, failure.status, failure.response) }
          // mongoNoteFailed(failure.device, failure.status, failure.response)
        }
      })
    })
}

const sendAndroid = (isDebug, androidConnection, defaults, userTokens, mongoNote) => {
  let androidNote = {
    android: {
      ttl: defaults.ttl,
      priority: defaults.priority,
      // data: {}, // extra data to be sent to client (e.g. routing data)
      notification: {
        title: mongoNote.title,
        body: mongoNote.body,
        // clickAction: mongoNote.action,
        icon: mongoNote.icon || defaults.icon,
        color: mongoNote.color || defaults.color,
        sound: mongoNote.sound || defaults.sound,
        tag: `${mongoNote.notId}`
      }
    }
  }
  // Make sure userTokens are an array of strings
  if (userTokens === '' + userTokens) { userTokens = [userTokens] }

  // Check if any tokens in there to send. If there are no tokens, I am probably sending to a topic.
  if (!userTokens.length) {
    if (isDebug) { console.log('sendAndroid no push tokens found') }
  } else {
    userTokens.map(value => {
      if (isDebug) { console.log('Android: Send message to only one token (the first if more): ' + value) }
    })
  }

  const token = userTokens.length === 1 ? userTokens[0] : null
  if (token) {
    androidNote.token = token
  } else if (mongoNote.topic) {
    androidNote.topic = mongoNote.topic
  } else { return }

  if (isDebug) { console.log('Final Android notification right before shoot out:', androidNote) }

  androidConnection.send(androidNote)
    .then(response => {
      // response is a message ID string.
      if (isDebug) { console.log('Successfully sent message:', response) }
    })
    .catch(error => {
      if (isDebug) { console.log('ANDROID ERROR: result of sender: ' + error) }
    })
}

const sendWeb = (isDebug, androidConnection, defaults, userTokens, mongoNote) => {
  let androidNote = {
    android: {
      ttl: defaults.ttl,
      priority: defaults.priority,
      // data: {}, // extra data to be sent to client (e.g. routing data)
      notification: {
        title: mongoNote.title,
        body: mongoNote.body,
        // clickAction: mongoNote.action,
        icon: mongoNote.icon || defaults.icon,
        color: mongoNote.color || defaults.color,
        sound: mongoNote.sound || defaults.sound,
        tag: `${mongoNote.notId}`
      }
    }
  }
  // Make sure userTokens are an array of strings
  if (userTokens === '' + userTokens) { userTokens = [userTokens] }

  // Check if any tokens in there to send. If there are no tokens, I am probably sending to a topic.
  if (!userTokens.length) {
    if (isDebug) { console.log('sendAndroid no push tokens found') }
  } else {
    userTokens.map(value => {
      if (isDebug) { console.log('Android: Send message to only one token (the first if more): ' + value) }
    })
  }

  const token = userTokens.length === 1 ? userTokens[0] : null
  if (token) {
    androidNote.token = token
  } else if (mongoNote.topic) {
    androidNote.topic = mongoNote.topic
  } else { return }

  if (isDebug) { console.log('Final Android notification right before shoot out:', androidNote) }

  androidConnection.send(androidNote)
    .then(response => {
      // response is a message ID string.
      if (isDebug) { console.log('Successfully sent message:', response) }
    })
    .catch(error => {
      if (isDebug) { console.log('ANDROID ERROR: result of sender: ' + error) }
    })
}


export { sendApn, sendAndroid, sendWeb }
