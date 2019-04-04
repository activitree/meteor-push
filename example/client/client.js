// Scenario: Notify a user of a liked post

import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
// import PostLikes from '../posts likes collection'
// import Posts from '../ posts Collection'

import { insertNotificationMethod } from '../notifications/methods' // inserts a Notification in Mongo for the use in UX

export const likePost = new ValidatedMethod({
  name: 'likePost',
  validate: new SimpleSchema({
    postId: String,
    userSlug: String, // e.g. mikey-picky
    userDisplayName: String // Mikey Picky
  }).validator(),
  run ({ postId, userSlug, userDisplayName }) {
    if (Meteor.isServer) {
      if (!this.userId) { throw new Meteor.Error('not-authorized') }
      const userId = this.userId

      // ... insert the like in Mongo

      this.unblock()

      insertNotificationMethod.call({
        /*
        // this is just sample code as existing in a live project. Is given here just for demo
        userId: someId,
        source: 'POST_LIKE',
        whoUrl: userSlug,
        what: captionFinal,
        whatUrl: postId,
        body: ' liked your post ',
        targetId: postId,
        avoidDuplicates: true
        */
      }, (err, resAsShouldSendBool) => {
        if (err) {
          console.log(err)
        } else {
          // on success of Mongo insert
          if (resAsShouldSendBool) { // this is a variable I use to flag whether Push notification should be sent
            Meteor.call('userPushNotification', { // this is the generalized Push Method in the "lib" folder
              title: `Someone liked your post. `,
              body: `${userDisplayName} likes your post ${`some dynamic post title`}.`,
              badge: 1,
              userId: someId // the user to whom a notification is being sent
            })
          }
        }
      })
    }
  }
})
