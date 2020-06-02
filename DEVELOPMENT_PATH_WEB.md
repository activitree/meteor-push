# Steps for implementing Web Push for supported browsers and PWA.
**This is running in production with https://www.activitree.com**

<img alt="Activitree" src="https://assets.activitree.com/images/ad_banner.jpg" width="100%">

meteor add activitree:push

** If you are looking for a more complex implementation of a Meteor PWA with Notifications, Offline Caching and Offline experience, please visit this repo: https://github.com/activitree/Meteor-PWA-Explained

As of 2.0.6, activitree:push looks for a Firebase configuration (client side) and if one is found, the package calls for an installation of `/firebase-messaging-sw.js` otherwise it will default to `sw.js`. You are expected to have both files in your `/public` folder if you plan to use Web Push notifications. Documentation here: https://github.com/activitree/Meteor-PWA-Explained/blob/master/3_Service_workers.md


* Add your configuration in startup/client: https://github.com/activitree/meteor-push/blob/master/example/app/startup/client/index.js

* Add your configuration in startup/server: https://github.com/activitree/meteor-push/blob/master/example/app/startup/server/index.js . This step requires the existence of a Firebase configuration file.

* Find an example for the Web Push client side implementation. This requires extra learning from other sources in order to understand how Web Push works, dos and donts: https://github.com/activitree/meteor-push/blob/master/example/app/handle_WebPush_In_UX/Notifications.js . Note the use of 2 hooks: ```import { webPushSubscribe, webPushUnsubscribe } from 'meteor/activitree:push' ```

* Implement a method that sends a push message. In general, you would have a collection where you keep track of user Notifications (independent of this package). Think Facebook, Notifications area where you see a history of all your notifications. Insert a notification and then Push it to the user.

* Have the Push Global Method available. This contains all available options. Where you build the method above, you can see in this method all keys available to you: https://github.com/activitree/meteor-push/blob/master/example/app/lib/push_methods.js

Copy the worker file here: https://github.com/activitree/meteor-push/blob/master/example/app/public/firebase-messaging-sw.js to your public folder. This needs to be available at https://www.your_address.com/firebase-messaging-sw.js. This worker is responsible for handling backgroud messages. Your 'action' key in the notification object contains the URL that will be open when the notification on screen is being clicked on.


***Note:***
With Firebase, some of the public credentials are exposed and visible on the client. Read this for an understanding of how to restrict public API keys in Firebase: https://medium.com/@impaachu/how-to-secure-your-firebase-project-even-when-your-api-key-is-publicly-available-a462a2a58843
