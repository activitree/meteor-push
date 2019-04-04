import { Meteor } from 'meteor/meteor'
import { CordovaPush } from 'meteor/activitree:push'

Meteor.startup(() => {
  if (Meteor.isCordova) { // all cases after Push for Web is implemented
    CordovaPush.Configure({
      appName: 'YourAppName',
      android: {
        alert: true,
        badge: true,
        sound: true,
        vibrate: true,
        clearNotifications: true,
        icon: 'statusbaricon',
        iconColor: '#337FAE',
        forceShow: true
        // topics: ['messages', 'notifications']
      },
      ios: {
        alert: true,
        badge: true,
        sound: true,
        clearBadge: true,
        topic: 'com.your_app_id' // your IOS app id.
      }
    })
  }

  // Configure Listeners

  /*
    CordovaPush.on('startup', notif => {
      // read whatever payload from the notification and route accordingly
      Example
      Sending notification:
        Push.send({
          from: 'main',
          title: title,
          text: text,
          query: {userId: userId},
          payload: { gotoView: 'thread', threadId: threadId }
        })
      Handling notification:
        var handlePushPayload = function(payload) {
          if (!payload) return;
          if (payload.gotoView === 'thread') {
            // Do something within your framework
          }
        };

      // Called when message received on startup (cold+warm)
      Push.addListener('startup', function(notification) {
        handlePushPayload(notification.payload);
      })
    })
    */
})