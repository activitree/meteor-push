import { Meteor } from "meteor/meteor"
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'

// This is the method you hook into from the client side. On the server, this calls the 'userPushNotification' method which
// is the generalized sending message. From various parts of your app, you may call different methods that result
// in sending different Push notifications with different payloads. You would do that with similar methods as the one below.
// 'userPushNotification' remains your "infrastructure method" to hook into with all other messaging methods.
// Let's call this the Global Messaging Method.

export const testSendPushToAllMethod = new ValidatedMethod({
  name: 'testSendPushToAllMethod',
  validate: new SimpleSchema({
    userId: { type: String, optional: true }
  }).validator(),
  run ({ userId }) {
    if (Meteor.isServer) {
      // you can find the next method in the lib folder (common to client/server)
      Meteor.call('userPushNotification', {
        userId,
        // or userIds: ['kut7TGfjfQZu7SNMK', 'kut7TGfjfQZu7SNMK'],
        // or token: { web: 'dndDkZ9xxxxxxxx:APA91bEhvG-EHQRWhdDmzrifqSxxxxxyyyyyyyxxxxxxxxxyyyyyy7FNzIBSD8VN6g8n8iX5b_KfBInbYgLRivEFIPQDr9WKS2IaZn9' },
        title: 'A new friendship request',
        body: 'Jimmy started following you',
        badge: 1,
        imageUrl: 'https://assets.activitree.com/covers/activitree.jpg',
        data: {
          thisIsGlobal: 'yes it is'
        },
        iosData: {
          thisIsGlobal: 'looking to overwrite the global value',
          thisIsIOS: 'tadam'
        },
        androidData: {
          someKey: 'this should always be a string',
          anotherKey: 'tadam'
        },
        webData: {
          thisIsGlobal: 'Nope, it isn\'t or maybe it is.'
        }
      }, err => {
        if (err) {
          console.log(err)
        }
      })
    }
  }
})