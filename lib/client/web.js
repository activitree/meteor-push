// https://firebase.google.com/docs/cloud-messaging/js/client
// https://firebase.google.com/docs/cloud-messaging/manage-tokens
import { Meteor } from 'meteor/meteor'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, deleteToken, isSupported } from 'firebase/messaging'
const { webPush } = Meteor.settings.public

const deviceStorage = window.localStorage
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

function EventState () {}

class WebPushHandle extends EventState {
  constructor () {
    super()
    this.configured = false
  }

  unregister () {
    isSupported().then(supported => {
      if (supported) {
        let Messaging
        if (this.push) {
          Messaging = this.push
        } else {
          const webApp = initializeApp(webPush.firebase)
          Messaging = getMessaging(webApp)
        }
        deleteToken(Messaging)
          .then(() => {
            Meteor.callAsync('token-remove', { _id: deviceStorage.getItem('Push.tokenId'), token: { vendor: 'web', token: deviceStorage.getItem('Push.token') } })
              .then(res => {
                // console.log('Found tokens and deleted: ', res)
                deviceStorage.removeItem('Push.token')
                deviceStorage.removeItem('Push.tokenId')
              })
              .catch(err => console.log('Could not delete this token from DB: ', err))
          })
      } else {
        return () => {}
      }
    })
  }

  Configure (configuration = {}, cb) {
    this.log = () => {
      if (configuration.debug) {
        console.log(...arguments)
      }
    }

    // https://medium.com/geekculture/how-to-detect-if-a-user-is-using-the-facebook-in-app-browser-41ccc2c5deca
    const isFacebookApp = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera
      return (ua.indexOf('FBAN') > -1) || (ua.indexOf('FBAV') > -1)
    }

    if (isFacebookApp()) { return false }

    this.log('WebPushHandle.Configure:', configuration)
    this.configured = !!deviceStorage.getItem('Push.token')

    const noConfiguration = !configuration.firebase || !configuration.publicVapidKey
    const swSupported = 'serviceWorker' in navigator

    const hardware = {
      // could get more data here, perhaps phone model, os version for internal analytics.
      platform: 'web'
    }

    !!Notification && Notification?.requestPermission().then(permission => {
      if (permission === 'granted') {
        isSupported().then(
          supported => {
            if (supported && swSupported && !noConfiguration) {
              const webApp = initializeApp(configuration.firebase)
              this.push = getMessaging(webApp)
              // Listen for the foreground messages. Background messages will be dealt with by the worker
              // Uncomment this and handle if you need in the Front-end.

              if (Meteor.isClient && !Meteor.isCordova) {
                getToken(this.push, { vapidKey: configuration.publicVapidKey }).then(newToken => {
                  // this.log('Calling subscribe')

                  const storedToken = deviceStorage.getItem('Push.token')

                  if (newToken && (!storedToken || storedToken !== newToken)) {
                    const token = { vendor: hardware.platform, token: newToken }
                    this.log('PushHandle.Token:', token)
                    deviceStorage.setItem('Push.token', newToken)

                    const tokenData = {
                      token,
                      appName: configuration.appName
                    }

                    Meteor.callAsync('token-insert', tokenData)
                      .then(res => {
                        this.log('Let\'s see the result of update', res)
                        deviceStorage.setItem('Push.tokenId', res) // _id of the document in Mongo
                        // console.log('calling the CB now.')
                      })
                      .catch(err => this.log('Could not save this token to DB: ', err))
                  }
                }).catch(err => {
                  this.log('Error on subscription: ', err)
                  this.log('WebPush error when asking for permission', interpretError(err))
                  deviceStorage.setItem('lastSubscriptionMessage', interpretError(err))
                })
              }

              onMessage(this.push, payload => {
                const options = {
                  title: payload.notification.title,
                  body: payload.notification.body,
                  icon: payload.notification.icon,
                  image: payload.notification.image,
                  action: payload.notification?.click_action || payload?.fcmOptions?.link
                }
                // console.log('should see this as foreground..', { options, payload, self, reg: self?.registration })
              })
            }
          }
        )
      } else {
        if (deviceStorage.getItem('Push.token')) { // && deviceStorage.getItem('Push.tokenId')) { // one implies the other.
          this.unregister()
        }
      }
    })
  }
}

const WebPush = new WebPushHandle()
export default WebPush
