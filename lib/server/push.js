// This is the match pattern for tokens
/* globals Match, check, EventState */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
import { Match } from 'meteor/check'

let Push = new EventState()

Push.notifications = new Mongo.Collection('_push_notifications')

// This is a general function to validate that the data added to notifications
// is in the correct format. If not this function will throw errors
const validateDocument = notification => {
  // Check the general notification
  const matchToken = Match.OneOf({ apn: String }, { android: String })

  check(notification, {
    from: Match.Optional(String),
    title: String,
    body: String,
    badge: Match.Optional(Match.Integer),
    userId: Match.Optional(String),
    topic: Match.Optional(String), // mandatory for IOS (via initialization), optional for Android (can send to a topic instead of token(s)
    sound: Match.Optional(String),
    icon: Match.Optional(String),
    color: Match.Optional(String),
    vibrate: Match.Optional(Boolean),
    contentAvailable: Match.Optional(Match.Integer),
    launchImage: Match.Optional(String),
    category: Match.Optional(String),
    threadId: Match.Optional(String),
    sent: Match.Optional(Boolean),
    sending: Match.Optional(Match.Integer),
    delayUntil: Match.Where(timestamp => (new Date(timestamp)).getTime() > 0), // like Date.now()
    notId: Match.Optional(Match.Integer),
    token: Match.Optional(matchToken),
    tokens: Match.Optional([matchToken]),
    createdAt: Match.Where(timestamp => (new Date(timestamp)).getTime() > 0), // like Date.now()
    createdBy: Match.OneOf(String, null)
  })

  // Make sure a token selector or query have been set
  if (!notification.token && !notification.tokens && !notification.userId) {
    throw new Error('No token selector or user found')
  }

  // If tokens array is set it should not be empty
  if (notification.tokens && !notification.tokens.length) {
    throw new Error('No tokens in array')
  }
}

Push.send = content => {
  const currentUser = (Meteor.isClient && Meteor.userId()) || (Meteor.isServer && (content.createdBy || '<SERVER>')) || null

  let notification = Object.assign({
    createdAt: Date.now(),
    createdBy: currentUser,
    sent: false,
    sending: 0
  }, content)

  validateDocument(notification)

  // Try to add the notification to send, we return an id to keep track
  return Push.notifications.insert(notification)
}

Push.allow = rules => {
  if (rules.send) {
    Push.notifications.allow({
      'insert': function (userId, notification) {
        // Validate the notification
        validateDocument(notification)
        // Set the user defined "send" rules
        return rules.send.apply(this, [userId, notification])
      }
    })
  }
}

Push.deny = rules => {
  if (rules.send) {
    Push.notifications.deny({
      'insert': function (userId, notification) {
        // Validate the notification
        validateDocument(notification)
        // Set the user defined "send" rules
        return rules.send.apply(this, [userId, notification])
      }
    })
  }
}

export { Push }
