/* globals Notification */
import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import { webPushSubscribe, webPushUnsubscribe } from 'meteor/activitree:push'

// IMPORTANT: you may want to consider to unsubscribe when you log out to prevent a non logged in user from receiving notifications..

class Notifications extends Component {
  render () {
    if (!('serviceWorker' in navigator) && !('PushManager' in window)) {
      return (
        <div>
          Notification feature is supported only in:<br />
          Chrome Desktop and Mobile (version 50+)<br />
          Firefox Desktop and Mobile (version 44+)<br />
          Opera on Mobile (version 37+)
        </div>
      )
    } else {
      return (
        <div style={{ padding: 40 }}>
          <h4>Enable Push</h4>
          <input
            type='checkbox'
            // control={<Switch />}
            // disabled={!window.localStorage.getItem('pushSupport')}
            label='Enable/Disable Notifications'
            onChange={this.handleSubscriptionToggle.bind(this)}
            defaultChecked={window.localStorage.getItem('WebPush-Subscribed')}
          />
          <p>Web Push supported:  <b>{window.localStorage.getItem('pushSupport') ? 'Yes' : 'No'}</b></p>
          {!Meteor.isCordova &&
            <p>Present Notification Permission: <b>{Notification.permission}</b></p>}
          <p>Is subscribed: <b>{window.localStorage.getItem('WebPush-Subscribed') ? 'Yes' : 'No'}</b></p>
          {window.localStorage.getItem('lastSubscriptionMessage') &&
            <p>Console status: {window.localStorage.getItem('lastSubscriptionMessage')}</p>}

          <button type='button' onClick={this.handleNotification}>Send Message</button>
        </div>
      )
    }
  }

  handleSubscriptionToggle () {
    const subscribed = window.localStorage.getItem('WebPush-Subscribed')
    if (subscribed) {
      webPushUnsubscribe()
    } else {
      webPushSubscribe()
    }
  }

  handleNotification (e) {
    e.preventDefault()
    Meteor.call('testSendPushToAllMethod', { userId: 'xxxxxx' }, err => {
      if (err) {
        console.log(err)
      }
    })
  }
}

export default Notifications
