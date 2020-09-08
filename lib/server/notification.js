const sendNotification = (isDebug, fcmConnections, defaults, userToken, mongoNote) => {
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

  const note = {
    android: {
      // ttl: '86400s', // use default max of 4 weeks
      // collapse_key: string,
      priority: defaults.priority,
      // restricted_package_name: string,
      data: {
        title: mongoNote.title,
        body: mongoNote.body,
        icon: mongoNote.icon || defaults.icon,
        color: mongoNote.color || defaults.color,
        sound: mongoNote.sound || defaults.sound,
        tag: `${mongoNote.notId}`,
        // click_action: mongoNote.action
        channel_id: mongoNote.channelId || defaults.channelId || defaults.topic,
        notification_priority: mongoNote.notificationPriority || defaults.notificationPriority,
        visibility: mongoNote.visibility || defaults.visibility,
        // notification_count: mongoNote.badge || defaults.badge, // this is supposed to be a number, can't send it because I need it to be a string.
        image: mongoNote.imageUrl || defaults.imageUrl,
        ...globalData,
        ...noteAndroidData
      },
      fcm_options: {
        analytics_label: mongoNote.analyticsLabel || defaults.analyticsLabel
      }
    },
    apns: {
      headers: {
        'apns-priority': defaults.apnsPriority
      },
      payload: {
        aps: {
          alert: {
            title: mongoNote.title,
            body: mongoNote.body,
            'launch-image': mongoNote.launchImage || defaults.launchImage
          },
          badge: mongoNote.badge || defaults.badge,
          sound: mongoNote.sound ? `${mongoNote.sound}.caf` : defaults.sound ? `${defaults.sound}.caf` : '',
          // 'click-action' // TODO check on this,
          data: {
            ...defaults.data,
            ...defaults.iosData,
            ...globalData,
            ...noteIosData
          }
        }
      },
      fcm_options: {
        analytics_label: mongoNote.analyticsLabel || defaults.analyticsLabel,
        image: mongoNote.imageUrl || defaults.imageUrl
      }
    },
    webpush: {
      headers: {
        Urgency: 'high',
        TTL: defaults.webTTL // mandatory, in seconds
      },
      data: {
        ...defaults.data,
        ...defaults.webData,
        ...globalData,
        ...noteWebData
      },
      notification: {
        title: mongoNote.title,
        body: mongoNote.body,
        icon: mongoNote.webIcon || defaults.webIcon,
        image: mongoNote.imageUrl || defaults.imageUrl
        /*
        actions: [
          {
            action: mongoNote.action || defaults.action,
            title: 'Book Appointment'
          }
        ] */
      }, // Can take valued from here: https://developer.mozilla.org/en-US/docs/Web/API/Notification.
      fcm_options: {
        link: mongoNote.action || defaults.action
      }
    }
  }

  if (userToken) {
    note.token = userToken
  } else if (note.topic) {
    note.topic = mongoNote.topic
  } else {
    if (isDebug) { console.log('Missing scope, no token or topic to send to') }
    return
  }

  if (isDebug) { console.log('Final notification right before shoot out:', JSON.stringify(note, null, 6)) }

  fcmConnections.send(note)
    .then(response => {
      if (isDebug) { console.log('Successfully sent message:', response) }
    })
    .catch(error => {
      if (isDebug) { console.log('FCM Sending Error: ', JSON.stringify(error, null, 4)) }
    })
}

export { sendNotification }
