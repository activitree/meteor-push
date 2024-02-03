/**
 * The global function for saving a Notification to DB.
 */
import { Match, check } from 'meteor/check'
import { Notifications } from './api'

const isDebug = process.env.PUSH_DEBUG === 'true'
function EventState () {}

const Push = new EventState()
if (process.env.SERVER_IS_PUSH_SAVER === 'true') {
  Push.notifications = Notifications

  const validateDocument = notification => {
    const matchToken = Match.OneOf({ apn: String }, { android: String }, { web: String })
    check(notification, {
      appName: String,
      userIds: Match.Optional(Array),
      tokens: Match.Optional([matchToken]),
      tokenIds: Match.Optional(Array),
      from: Match.Optional(String),
      title: String,
      subtitle: Match.Optional(String),
      body: String,
      image: Match.Optional(String),
      imageType: Match.Optional(String),
      badge: Match.Optional(Match.Integer),
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
      data: Match.Optional(Object), // Make sure this object only contains string keys.
      iosData: Match.Optional(Object),
      androidData: Match.Optional(Object), // Android data ca only take string values do further validation here
      webData: Match.Optional(Object),
      action: Match.Optional(String),
      apnsPushType: Match.Optional(String), // can take value from here: https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
      apnsCategory: Match.Optional(String), // specific to Apple
      webBadge: Match.Optional(String),
      webIcon: Match.Optional(String)
    })

    // Make sure a valid receiver exists
    if (!(notification.tokens?.length || notification.userIds?.length || notification.tokenIds?.length)) {
      throw new Error('No token selector or user found')
    }
  }

  Push.send = content => {
    delete content.currentUser

    const notification = {
      appName: 'Activitree', // TODO check why this is not coming from configuration
      createdAt: Date.now(),
      sent: false,
      sending: 0,
      ...content
    }

    validateDocument(notification)

    isDebug && console.log('Right before the insert: ', notification)

    return Push.notifications.insert(notification)
  }
} else {
  console.info(
    '#####################################################################\n',
    'You either haven\'t set the SERVER_IS_PUSH_SAVER env var, or this was set to false and consequently this server is not a Push Saver.\n',
    'coming from pushToDB.js',
    '\n#####################################################################'
  )
}

export { Push }
