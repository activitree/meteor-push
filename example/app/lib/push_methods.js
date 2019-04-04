// Push Methods. Perhaps this could be part of the package itself
// This method is the generalized method for both Client and Server. In the client folder you can find an example of
// how this method is being called.

import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Push } from 'meteor/activitree:push'
import SimpleSchema from 'simpl-schema'

export const userPushNotification = new ValidatedMethod({
  name: 'userPushNotification',
  validate: new SimpleSchema({
    title: String,
    body: String,
    badge: Number,
    userId: String,
    topic: { type: String, optional: true },
    sound: { type: String, optional: true },
    icon: { type: String, optional: true },
    color: { type: String, optional: true },
    vibrate: { type: Boolean, optional: true },
    contentAvailable: { type: Boolean, optional: true },
    launchImage: { type: String, optional: true },
    category: { type: String, optional: true },
    threadId: { type: String, optional: true },
    delayUntil: { type: Date, optional: true },
    token: { type: String, optional: true },
    tokens: { type: Array, optional: true },
    'tokens.$': { type: String, optional: true },
    from: { type: String, optional: true },
    data: { type: Object, blackbox: true, optional: true },
    action: { type: String, optional: true }
  }).validator(),
  run ({
         title,
         body,
         badge,
         userId,
         topic,
         sound,
         icon,
         color,
         vibrate,
         contentAvailable,
         launchImage,
         category,
         threadId,
         delayUntil,
         token,
         tokens,
         from,
         data,
         action
       }) {
    if (userId === '' || userId === undefined || userId === 'undefined') {
      throw new Meteor.Error(404, 'No userId was set, userId was ' + userId)
    }

    // topic in IOS and Android have different behaviors. In IOS it must be set as the app id,
    // in Android a notification can be sent to a topic (to its subscribers)

    if (this.userId) {
      const notification = {
        title,
        body,
        badge,
        userId,
        notId: Math.round(new Date().getTime() / 1000)
      }

      if (topic) { notification.topic = topic }
      if (icon) { notification.icon = icon }
      if (color) { notification.color = color }
      if (sound) { notification.sound = sound }
      if (contentAvailable) { notification.contentAvailable = contentAvailable }
      if (launchImage) { notification.launchImage = launchImage }
      if (category) { notification.category = category }
      if (threadId) { notification.threadId = threadId }
      if (delayUntil) { notification.delayUntil = delayUntil }
      if (token) { notification.token = token }
      if (tokens) { notification.tokens = tokens }
      if (from) { notification.from = from }
      if (vibrate) { notification.vibrate = vibrate }
      if (data) { notification.data = data }
      if (action) { notification.action = action }

      Push.send(notification)
    }
  }
})

export const sendPushNotificationBadge = new ValidatedMethod({
  name: 'send.push.notification.badge',
  validate: new SimpleSchema({
    userId: { type: String },
    count: { type: Number }
  }).validator(),
  run ({ userId, count }) {
    Push.send({
      from: 'AppName',
      title: '',
      text: '',
      badge: count,
      query: { userId }
    })
  }
})

/*
// Not tested
export const removeHistory = new ValidatedMethod({
  name: 'remove.push.notification.history',
  validate: new SimpleSchema({
  }).validator(),
  run () {
    NotificationHistory.remove({}, function (error) {
      if (!error) {
        // console.log('All history removed')
      }
    })
  }
})
*/
