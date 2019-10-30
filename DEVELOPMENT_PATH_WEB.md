# Steps for implementing Web Push for supported browsers and PWA.
**This is running in production with https://www.activitree.com**

<img alt="Activitree" src="https://assets.activitree.com/images/ad_banner.jpg" width="100%">

meteor add activitree:push

* Add your configuration in startup/client: https://github.com/activitree/meteor-push/blob/master/example/app/startup/client/index.js

* Add your configuration in startup/server: https://github.com/activitree/meteor-push/blob/master/example/app/startup/server/index.js . This step requires the existence of a Firebase configuration file.

* Find an example for the Web Push client side implementation. This requires extra learning from other sources in order to understand how Web Push works, dos and donts: https://github.com/activitree/meteor-push/blob/master/example/app/handle_WebPush_In_UX/Notifications.js

* Implement a method that sends a push message. In general, you would have a collection where you keep track of user Notifications (independent of this package). Think Facebook, Notifications area where you see a history of all your notifications. Insert a notification and then Push it to the user.

* Have the Push Global Method available. This contains all available options. Where you build the method above, you can see in this method all keys available to you: https://github.com/activitree/meteor-push/blob/master/example/app/lib/push_methods.js




