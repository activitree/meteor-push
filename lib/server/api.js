import { Meteor } from 'meteor/meteor'

const uri = Meteor.isProduction ? process.env.MONGO_PUSH_URL : 'mongodb://127.0.0.1:3001/meteor'
const _driver = new MongoInternals.RemoteCollectionDriver(uri, {})
const Tokens = new Meteor.Collection('_push_app_tokens', { _driver })
Tokens.createIndexAsync({ token: 1 })
Tokens.createIndexAsync({ userId: 1, tokens: 1 })

const Notifications = new Meteor.Collection('_push_notifications', { _driver })
Notifications.createIndexAsync({ createdAt: 1 })
Notifications.createIndexAsync({ sent: 1 })
Notifications.createIndexAsync({ sending: 1 })
// Notifications.createIndexAsync({ delayUntil: 1 })

export { Tokens, Notifications }
