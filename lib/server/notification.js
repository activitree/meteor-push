const isDebug = process.env.PUSH_DEBUG === 'true'

const sendNotification = (fcmConnections, defaults, userToken, mongoNote) => {
  // https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages
  /**
   * For Android, the entire notification goes into 'data' as per the best practices of cordova-push-plugin
   * All commented fields are part of the Firebase-Admin but are not necessary for the present setup. For example, all keys of the
   * 'data' object must be strings while in Firebase-Admin some keys which would normally go under 'notification', are boolean.
   * I keep the commented fields just as quick reference for the standard.
   */
  const noteAndroidData = mongoNote.androidData || {}
  const noteIosData = mongoNote.iosData || {}
  const noteWebData = mongoNote.webData || {}
  const globalData = mongoNote.data || {}

  // https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.androidconfig
  const android = {
    collapseKey: 'collapse', // mongoNote.collapseKey || defaults.collapseKey,
    priority: mongoNote.priority || defaults.priority, // FCM priority
    ttl: 86400000, // 24 hours
    notification: {
      title: mongoNote.title,
      body: mongoNote.body,
      color: defaults.color,
      icon: defaults.icon,
      imageUrl: mongoNote.image || defaults.image, // keep some consistency in the way Push notifications look, with Web Push.
      notificationCount: `${mongoNote.badge || defaults.badge}`,
      clickAction: 'com.adobe.phonegap.push.background.MESSAGING_EVENT'
    },
    data: {
      // 'image-type': mongoNote.imageType || defaults.imageType,
      summaryText: mongoNote.subtitle,
      ...globalData,
      ...noteAndroidData
    },
    fcmOptions: {
      analyticsLabel: mongoNote.analyticsLabel || defaults.analyticsLabel
    }
  }

  const apns = {
    // https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
    headers: {
      'apns-priority': mongoNote.priority || defaults.apnsPriority,
      'apns-topic': mongoNote.apnsTopic || defaults.apnsTopic,
      'apns-collapse-id': mongoNote.apnsCollapseId || defaults.apnsCollapseId,
      'apns-push-type': mongoNote.apnsPushType || defaults.apnsPushType
    },
    payload: {
      aps: { // https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification
        // category: 'NEW_MESSAGE_CATEGORY',
        alert: {
          title: mongoNote.title,
          subtitle: mongoNote.subtitle,
          body: mongoNote.body
          // 'launch-image': mongoNote.launchImage || defaults.launchImage
        },
        badge: mongoNote.badge || defaults.badge,
        sound: mongoNote.sound ? `${mongoNote.sound}.caf` : defaults.sound ? `${defaults.sound}.caf` : '',
        click_action: mongoNote.action || defaults.action,
        data: {
          ...defaults.data,
          ...defaults.iosData,
          ...globalData,
          ...noteIosData
        }
      }
    },
    fcm_options: {
      analytics_label: mongoNote.analyticsLabel || defaults.iosAnalyticsLabel || defaults.analyticsLabel,
      image: mongoNote.image || defaults.iosImage || defaults.image // image has to exist in the app Resources.
    }
  }

  // https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.webpushnotification.md#webpushnotification_interface
  // https://developers.google.com/web/fundamentals/push-notifications/common-notification-patterns#merging_notifications
  // https://developers.google.com/web/fundamentals/push-notifications
  const webpush = {
    headers: {
      Urgency: 'high',
      TTL: defaults.webTTL // mandatory, in seconds
      // Topic: mongoNote.collapseKey
    },
    data: {
      ...defaults.data,
      ...defaults.webData,
      ...globalData,
      ...noteWebData
    },
    notification: {
      /*
      actions: [
        {
          action: mongoNote.action || defaults.action || 'https://www.activitree.com/p/5snu3EbyDdCNW7G3d',
          icon: some_icon,
          title: 'Book Appointment'
        },
        {
          action: 'https://www.activitree.com/terms',
          icon: some_other_icong,
          title: 'Something else'
        }
      ], */
      badge: defaults.webBadge, // Icon used on mobile, with transparency
      body: mongoNote.body,
      data: {}, // ok to use.
      icon: mongoNote.webIcon || defaults.webIcon, // In whatsapp this is used to show the user's avatar in a web notification.
      image: mongoNote.image || defaults.image, // On Mobile it produces a large image when expanding a notification
      click_action: mongoNote.action || defaults.action,
      renotify: mongoNote.webRenotify || defaults.webRenotify, // the default value
      requireInteraction: mongoNote.webRequireInteraction || defaults.webRequireInteraction || defaults.requireInteraction, // the default value
      silent: mongoNote.webSilent || defaults.webSilent, // the default value
      tag: mongoNote.webTag || defaults.webTag,
      timestamp: mongoNote.webTimestamp || defaults.webTimestamp,
      title: mongoNote.title,
      vibrate: mongoNote.vibrate || defaults.vibrate
    },
    fcm_options: {
      // link: mongoNote.action || defaults.action,
      analytics_label: mongoNote.webAnalyticsLabel || defaults.webAnalyticsLabel || defaults.analyticsLabel
    }
  }

  // eslint-disable-next-line camelcase
  const fcm_options = {
    analytics_label: mongoNote.analyticsLabel || defaults.analyticsLabel
  }

  // eslint-disable-next-line camelcase
  const note = { /* android, apns, */ webpush, fcm_options }
  // TODO check if I can send to multiple tokens at once
  if (userToken) {
    note.token = userToken
  } else if (note.topic) {
    note.topic = mongoNote.topic
  } else {
    if (isDebug) { console.log('Missing scope, no token or topic to send to') }
    return
  }

  if (isDebug) { console.log('Final notification right before shoot out:', note) }

  fcmConnections.send(note)
    .then(response => {
      if (isDebug) { console.log('Successfully sent message:', response) }
    })
    .catch(error => {
      if (isDebug) { console.log('FCM Sending Error: ', error?.message) }
    })
}

export { sendNotification }

// 'apns-topic': defaults.topic, // do not remove, required by apns-push-type === 'alert' or 'background' or 'location'
// 'apns-collapse-id': mongoNote.collapseKey,
// 'apns-push-type': mongoNote.apnsPushType || defaults.apnsPushType, // one of ['alert', 'background', 'location', 'voip' ... etc.]
// IOS makes it truly complicated. When type is 'background', priority must be 5. Check the url for more details.
