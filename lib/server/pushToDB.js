// This is the match pattern for tokens
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Match, check } from 'meteor/check'

function EventState () {}

const Push = new EventState()

Push.notifications = new Mongo.Collection('_push_notifications')
Push.notifications._ensureIndex({ createdAt: 1 })
Push.notifications._ensureIndex({ sent: 1 })
Push.notifications._ensureIndex({ sending: 1 })
Push.notifications._ensureIndex({ delayUntil: 1 })
Push.notifications._ensureIndex({ userId: 1 })

const validateDocument = notification => {
  const matchToken = Match.OneOf({ apn: String }, { android: String }, { web: String })
  check(notification, {
    from: Match.Optional(String),
    title: String,
    body: String,
    imageUrl: Match.Optional(String),
    badge: Match.Optional(Match.Integer),
    userId: Match.Optional(String),
    userIds: Match.Optional(Array),
    token: Match.Optional(matchToken),
    tokens: Match.Optional([matchToken]),
    tokenId: Match.Optional(String),
    tokenIds: Match.Optional(Array),
    topic: Match.Optional(String), // mandatory for IOS (via initialization), optional for Android (can send to a topic instead of token(s)
    sound: Match.Optional(String),
    icon: Match.Optional(String),
    color: Match.Optional(String),
    vibrate: Match.Optional(Boolean),
    contentAvailable: Match.Optional(Boolean),
    launchImage: Match.Optional(String),
    category: Match.Optional(String),
    threadId: Match.Optional(String),
    sent: Match.Optional(Boolean),
    sending: Match.Optional(Match.Integer),
    delayUntil: Match.Optional(Match.Where(timestamp => (new Date(timestamp)).getTime() > 0)), // like Date.now()
    notId: Match.Optional(Match.Integer),
    createdAt: Match.Where(timestamp => (new Date(timestamp)).getTime() > 0), // like Date.now()
    createdBy: Match.OneOf(String, null),
    data: Match.Optional(Object), // Make sure this object only contains string keys.
    iosData: Match.Optional(Object),
    androidData: Match.Optional(Object), // Android data ca only take string values do further validation here
    webData: Match.Optional(Object),
    action: Match.Optional(String)
  })

  // Make sure a token selector or query have been set
  if (!notification.token && !notification.tokens && !notification.userId && !notification.userIds && !notification.tokenId && !notification.tokenIds) {
    throw new Error('No token selector or user found')
  }

  // If tokens array is set it should not be empty
  if (notification.userIds && !notification.userIds.length) {
    throw new Error('No tokens in array')
  }

  // If tokens array is set it should not be empty
  if (notification.tokens && !notification.tokens.length) {
    throw new Error('No tokens in array')
  }
}

Push.send = content => {
  const currentUser = (Meteor.isClient && Meteor.userId()) || (Meteor.isServer && (content.createdBy || '<SERVER>')) || null

  const notification = {
    createdAt: Date.now(),
    createdBy: currentUser,
    sent: false,
    sending: 0,
    ...content
  }

  validateDocument(notification)

  return Push.notifications.insert(notification)
}

Push.allow = rules => {
  if (rules.send) {
    Push.notifications.allow({
      insert: function (userId, notification) {
        // Validate the notification
        // validateDocument(notification)
        // Set the user defined "send" rules
        return rules.send.apply(this, [userId, notification])
      }
    })
  }
}

Push.deny = rules => {
  if (rules.send) {
    Push.notifications.deny({
      insert: function (userId, notification) {
        // Validate the notification
        // validateDocument(notification)
        // Set the user defined "send" rules
        return rules.send.apply(this, [userId, notification])
      }
    })
  }
}

export { Push }
