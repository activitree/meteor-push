/* globals Notification */
import firebase from 'firebase/app'
import '@firebase/messaging'

/* globals EventState, Package */
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'

const deviceStorage = window.localStorage
const addUserId = Boolean(Package['accounts-base'])

const interpretError = err => {
  // eslint-disable-next-line no-prototype-builtins
  if (err.hasOwnProperty('code') && err.code === 'messaging/permission-default') {
    return 'You need to allow the site to send notifications'
    // eslint-disable-next-line no-prototype-builtins
  } else if (err.hasOwnProperty('code') && err.code === 'messaging/permission-blocked') {
    return 'Currently, the site is blocked from sending notifications. Please unblock the same in your browser settings'
  } else {
    return 'Unable to subscribe you to notifications'
  }
}

class WebPushHandle extends EventState {
  constructor () {
    super()
    this.configured = false
    this.debug = false
  }

  log () {
    if (this.debug) {
      console.log(...arguments)
    }
  }

  Configure (configuration = {}) {
    if (!this.configured) {
      this.log('WebPushHandle.Configure:', configuration)
      this.configured = true

      Meteor.startup(() => {
        if (!configuration.firebase || !configuration.publicVapidKey) {
          this.log('Firebase configuration is required: \'messagingSenderId\' and a \'PublicVapidKey\'')
          return false
        }

        const webApp = firebase.initializeApp(configuration.firebase)
        if (firebase.messaging.isSupported()) {
          this.messaging = webApp.messaging()
          this.messaging.usePublicVapidKey(configuration.publicVapidKey)

          if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
              const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                updateViaCache: 'none'
              })
              this.messaging.useServiceWorker(registration)

              /**
               * Listen for the foreground messages. Background messages will be dealt with by the worker
               */
              this.messaging.onMessage(payload => {
                const title = payload.notification.title
                const options = {
                  body: payload.notification.body,
                  icon: payload.notification.icon,
                  actions: [
                    {
                      action: payload.fcmOptions.link,
                      title: 'Book Appointment'
                    }
                  ]
                }
                registration.showNotification(title, options)
              })

              // TODO see what other listeners I can add here.
            })
          }

          this.messaging.onTokenRefresh(() => {
            // Delete the old Push from MongoDB and from the localStore
            this.unsubscribe()
            this.messaging.getToken().then(token => {
              this.emitState('token', token)
            }).catch(err => {
              deviceStorage.setItem('lastSubscriptionMessage', interpretError(err))
            })
          })
        }

        this.subscribe = () => {
          // If the user did not block notifications, request for a token.
          if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(res => {
              if (res === 'denied') {
                deviceStorage.setItem('lastSubscriptionMessage', 'Permission wasn\'t granted. Allow a retry.')
                return
              }
              if (res === 'default') {
                deviceStorage.setItem('lastSubscriptionMessage', 'The permission request was dismissed.')
                return
              }
              this.messaging.getToken().then(token => {
                console.log('Calling subscribe')
                if (token) {
                  this.emitState('token', token)
                } else {
                  deviceStorage.setItem('lastSubscriptionMessage', 'No Instance ID token available. Request permission to generate one.')
                }
              }).catch(err => {
                console.log(err)
                this.log('WebPush error when asking for permission', interpretError(err))
              })
            })
          }
        }

        this.unsubscribe = () => {
          const pushTokenId = deviceStorage.getItem('pushTokenId')
          if (pushTokenId) {
            console.info('I call an unsubscription to Push')
            Meteor.call('push-unsub-webpush', pushTokenId, err => {
              if (err) {
                console.log('Could not save this token to DB: ', err)
              } else {
                deviceStorage.removeItem('WebPush-Subscribed')
                deviceStorage.removeItem('pushTokenId')
                deviceStorage.removeItem('token')
              }
            })
          }
        }
        // this.emitState('ready')
      })

      const initPushUpdates = appName => {
        Meteor.startup(() => {
          WebPush.on('token', token => {
            const data = {
              token: { web: token },
              appName,
              userId: Meteor.userId() || null
            }
            Meteor.call('push-update', data, (err, res) => {
              if (err) {
                console.log('Could not save this token to DB: ', err)
              } else {
                const { doc } = res
                deviceStorage.setItem('pushTokenId', doc._id)
                deviceStorage.setItem('token', doc.token.web)
                deviceStorage.setItem('WebPush-Subscribed', true)
                deviceStorage.removeItem('lastSubscriptionMessage')
              }
            })
          })

          // TODO Start listening for user updates if accounts package is added
          if (addUserId) {
            Tracker.autorun(() => {
              Meteor.userId()
              const storedTokenId = deviceStorage.getItem('pushTokenId')

              // TODO check on this logic. This is for when a user logs in on a station after another user. Each user needs to set its own
              // Perhaps compare this with deviceStorage.getItem('WebPush-Subscribed', true)
              // Push context on that machine while the Token of the machine remains the same.
              // Eventually cater to a situation where a user receives certain Notifications, logs out and then receives only "general" notifications.
              if (!this.firstRun) {
                console.log('I will need to monitor and see how many times I run this.')
                if (storedTokenId) { Meteor.call('push-setuser', storedTokenId) }
              }
            })
          }
        })
      }
      initPushUpdates(configuration.appName)
    } else {
      this.log('Push.Error: "Push.Configure may only be called once"')
      throw new Error('Push.Configure may only be called once')
    }
  }
}

const WebPush = new WebPushHandle()
export default WebPush

const webPushConfigure = () => {
  // return WebPush.Configure()
}

function webPushSubscribe () {
  return WebPush.subscribe()
}

const webPushUnsubscribe = () => {
  return WebPush.unsubscribe()
}

export { webPushSubscribe, webPushUnsubscribe, webPushConfigure }
