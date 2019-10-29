import { Meteor } from "meteor/meteor"

export const test = new ValidatedMethod({
  name: 'testMethod',
  validate: new SimpleSchema({
    userId: { type: String, optional: true }
  }).validator(),
  run ({ userId }) {
    if (Meteor.isServer) {
      Meteor.call('testSendPushToAllMethod', {
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
          thisisIOS: 'tadam'
        },
        androidData: {
          someKey: 'this should always be a string',
          anotherKey: 'tadam'
        },
        webData: {
          thisIsGlobal: 'Nope, it isn\'t'
        }
      }, err => {
        if (err) {
          console.log(err)
        }
      })
    }
  }
})