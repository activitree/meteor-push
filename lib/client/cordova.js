/* global device: false */
/* global PushNotification: false, EJSON, Package */

import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import EventEmitter from 'events'

const deviceStorage = window.localStorage
const addUserId = Boolean(Package['accounts-base'])

const getService = () => {
  if (/android/i.test(device.platform)) {
    return 'android'
  } else if (/ios/i.test(device.platform)) {
    return 'apn'
  }
  return 'unknown'
}

const PushEventState = new EventEmitter()
function EventState () {}

class PushHandle extends EventState {
  constructor () {
    super()
    this.configured = false
  }

  setBadge (count) {
    this.once('ready', () => {
      if (/ios/i.test(device.platform)) {
        this.log('PushHandle.setBadge:', count)
        // xxx: at the moment only supported on iOS
        this.push.setApplicationIconBadgeNumber(() => {
          this.log('PushHandle.setBadge: was set to', count)
        }, (e) => {
          PushEventState.emit('error', {
            type: getService() + '.cordova',
            error: 'PushHandle.setBadge Error: ' + e.message
          })
        }, count)
      }
    })
  }

  unregister (successHandler, errorHandler) {
    if (this.push) {
      this.push.unregister(successHandler, errorHandler)
    } else {
      errorHandler(new Error('PushHandle.unregister, Error: "Push not configured"'))
    }
  }

  Configure (configuration = {}) {
    if (!this.configured) {
      this.log = () => {
        if (configuration.debug) {
          console.log(...arguments)
        }
      }

      this.log('PushHandle.Configure:', configuration)
      this.configured = true

      Meteor.startup(() => {
        if (typeof PushNotification !== 'undefined') {
          this.push = PushNotification.init(configuration)
          /*
           PushNotification.hasPermission(data => {
             console.log('has permission? ', data)
           })
           */

          this.push.on('registration', data => {
            const storedToken = deviceStorage.getItem('token')
            const oldToken = (storedToken && storedToken.apn) || (storedToken && storedToken.android) || null
            this.log('device registration has been triggered with this data: ', data)
            if (data && data.registrationId && oldToken !== data.registrationId) {
              const token = { [getService()]: data.registrationId }
              this.log('PushHandle.Token:', token)
              PushEventState.emit('token', token)
            }
            PushEventState.emit('registration', ...arguments)
          })

          this.push.on('notification', data => {
            // this.log('PushHandle.Notification:', data)
            if (data.additionalData.ejson) {
              if (data.additionalData.ejson === '' + data.additionalData.ejson) {
                try {
                  data.payload = EJSON.parse(data.additionalData.ejson)
                  this.log('PushHandle.Parsed.EJSON.Payload:', data.payload)
                } catch (err) {
                  this.log('PushHandle.Parsed.EJSON.Payload.Error', err.message, data.payload)
                }
              } else {
                data.payload = EJSON.fromJSONValue(data.additionalData.ejson)
                this.log('PushHandle.EJSON.Payload:', data.payload)
              }
            }

            // Emit alert event - this requires the app to be in foreground
            if (data.message && data.additionalData.foreground) {
              PushEventState.emit('alert', data)
            }

            // Emit sound event
            if (data.sound) {
              PushEventState.emit('sound', data)
            }

            // Emit badge event
            if (typeof data.count !== 'undefined') {
              this.log('PushHandle.SettingBadge:', data.count)
              this.setBadge(data.count)
              PushEventState.emit('badge', data)
            }

            if (data.additionalData.foreground) {
              this.log('PushHandle.Message: Got message while app is open:', data)
              // TODO handle this
              PushEventState.emit('message', data)
            } else {
              this.log('PushHandle.Startup: Got message while app was closed/in background:', data)
              PushEventState.emit('startup', data)
            }
          })

          this.push.on('error', e => {
            this.log('PushHandle.Error:', e)
            PushEventState.emit('error', {
              type: getService() + '.cordova',
              error: e.message
            })
          })

          PushEventState.emit('ready')
        }
      })

      const initPushUpdates = appName => {
        Meteor.startup(() => {
          PushEventState.on('token', token => {
            this.log('Got token:', token)
            const data = {
              token,
              appName,
              userId: Meteor.userId() || null
            }
            Meteor.call('push-update', data, (err, res) => {
              if (err) {
                this.log('Could not save this token to DB: ', err)
              } else {
                this.log('Let\'s see the result of update', res)
                const { doc, removed } = res
                if (Meteor.isCordova) {
                  if (removed) {
                    deviceStorage.removeItem('pushTokenId')
                    deviceStorage.removeItem('token')
                  } else {
                    deviceStorage.setItem('pushTokenId', doc._id) // _id of the document in Mongo
                    deviceStorage.setItem('token', doc.token.apn || doc.token.android)
                  }
                }
              }
            })
          })

          // Start listening for user updates if accounts package is added
          if (addUserId) {
            Tracker.autorun(() => {
              Meteor.userId()
              const storedTokenId = deviceStorage.getItem('pushTokenId')

              if (!this.firstRun) {
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

export const CordovaPush = new PushHandle()
