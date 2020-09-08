# Meteor Push Notifications with Firebase-Admin for IOS, Android and Web/PWA (Includes breaking changes when coming from V1).
<a href="https://www.repostatus.org/#active"><img src="https://www.repostatus.org/badges/latest/active.svg" alt="Project Status: Active – The project has reached a stable, usable state and is being actively developed." /></a>

**This is running in production with https://www.activitree.com**

<img alt="Activitree" src="https://assets.activitree.com/images/ad_banner.jpg" width="100%">

V1 -> V2: Breaking changes. Requires conversion of Tokens from APN to FCM (for IOS) and update of client and server configurations. Methods are more complex now, with more options and we included a path for Web/PWA implementation.

To continue with V1, you may fork from here: https://github.com/activitree/meteor-push/commit/45d97977c37d70d561fcdc4cd78e3af3bc910e88 and read here: https://forums.meteor.com/t/how-to-install-meteor-package-direct-from-github/1693

# For users of Raix Push or V1 of this.

If you are coming from RAIX:Push or from V1 of this package please make sure you update the following things:
* Client startup configuration file
* Server startup configuration file
* Be familiar with the cordova-push-plugin: https://github.com/phonegap/phonegap-plugin-push
* Migrate your IOS tokens from APN to FCM (https://www.thepolyglotdeveloper.com/2017/06/apns-tokens-fcm-tokens-simple-http/).
You can use the IOS token tester provided by https://www.activitree.com here: https://github.com/activitree/NODE-APN-Notifications-Tester
* The Firebase API in use: https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages. Most of the API is implemented/adapted. If there is anything extra you need, open an issue and ask a friend to send a commit.
In order to run IOS via FCM, you need to configure the Firebase Project to include Apple APN security certificate. All details here: https://firebase.google.com/docs/cloud-messaging/ios/certs. If you are coming from V1, you no longer need to store the .p8 certificate on your Meteor server, don't forget to delete it.

Firebase Javascript SDK Change log: https://firebase.google.com/support/releases

Under the hood:
* Firebase-Admin Node SDK used server side for sending messages
* cordova-push-plugin: handles mobile platforms
* Firebase handles configuration of Web/PWA clients.

Simplified development path: https://github.com/activitree/meteor-push/tree/master

# Main logic:
  ## Server:
  Use the Push configurator in the Meteor Startup to have everything set, as well as setting defaults for various notification   object keys. (E.g TTL, icon, color, launch screen for IOS, etc).
  * internalMethods.js: all Meteor methods used by the package
  * notification.js. This is where the actual notification is being constructed before passing to the sender
  * pushToDb.js Does all the Push - Meteor - MongoDB work, saving a notification queue which is then being processed by the sender.
  * pushToDevice.js Picks up notifications from MongoDB and sends them out via Firebase-Admin.

  ## Client:
  Use the Push configurator to set defaults for Cordova and Web Push.
  * web.js Contains the arhitecture for registering a browser/PWA (get a token, save to browser storage for browser UX use,     save the token in MongoDB. Also contains the necessary hooks for developer's convenience.
  * cordova.js Contains the arhitecture for registering a Cordova App (get a token, save to device storage for App UX use,       save the token in MongoDB)
  For cordova please find the Cordova specific listeneres here: https://github.com/phonegap/phonegap-plugin-push/blob/master/docs/API.md#pushonevent-callback
In activitree:push, listeners are best set in client/startup using 'CordovaPush.push'. Example:

```javascript
CordovaPush.push.on('notification', data => {
      console.log('this is my message: ', data)
    })
```
  
Same as the V1, the repo contains an Example folder with files at the expected location. This is not runnable Meteor project, and it is just intended to offer some convenience in understanding where things go.
______________________________________

For a successful processing of Android, please have all defaults set (althoug you might not have a sound file or icon etc) or send the keys within your notification method. Defaults are set in ```startup/server/push.js```. When Android keys are missing and debuggin is set to ```true``` you may receive this error: 'android.data must only contain string values'.
 
 
 
## Prerequisites:

* Create an Apple p8 certificate: https://developer.clevertap.com/docs/how-to-create-an-ios-apns-auth-key
* Create an Firebase project and generate a google-services.json file. The Firebase project is supposed to generate a Messaging API in Google Console.(See png files in the Example folder)
* Get a firebase server account: https://stackoverflow.com/questions/40799258/where-can-i-get-serviceaccountcredentials-json-for-firebase-admin/40799378
Or visit here: https://console.firebase.google.com/project/**YOUR_PROJECT**/settings/serviceaccounts/adminsdk

meteor add activitree:push

All settings suggested are what worked in testing but you are free to change everything indeed.
The Android and IOS ware succesfuly built with Meteor. I mention this because before 1.8.1 I could only build Android with Android Studio.


# WebPush and PWA
First read this article to understand the concept and workflow: https://webengage.com/blog/web-push-notification-guide/ or https://www.airship.com/resources/explainer/web-push-notifications-explained/

Copy the worker file in the Example /public to your public folder. This needs to be available at https://www.your_address.com/firebase-messaging-sw.js. This worker is responsible for handling backgroud messages.

You can import two hooks: ``` import { webPushSubscribe, webPushUnsubscribe } from 'meteor/activitree:push' ```
Find the example in example/handle_WebPush_In_UX/Notification.js (React version). The method used for sending the message is at imports/api/collection/notifications/methods.js

# IOS
After IOS Build, go to /app/.meteor/local/cordova-build/platforms/ios and (if you use Terminal) run 'pod install'. After this, in XCode, update the IOS version for each and every pod installed.

In Meteor 1.8.1 with xCode 11, better use a Lecacy Build System (File/Workspace Settings...) to avoid varios issue related to old Cordova tech not keeping up with the fast pace of Swift development.

Cordova-push-plugin will automatically set IOS through FCM if it sees a GoogleService-Info.plist in the IOS project root.
Ideally you would have this in your mobile-config (src would be your prefered location) and make sure that you see this configuration withing the IOS config.xml file.
```
App.appendToConfig(`
<platform name="ios">
  <resource-file target="GoogleService-Info.plist" src="../../../cordova-build-override/GoogleService-Info.plist"/>
</platform>
`)
```

# Android
On the first build it will eventually fail due to wrong/inadequate Gradle configuration. However the first build is necessary in order to build the files we are going to work with.

This repo contains sample files of configurations that worked in testing. You will find the files at a similar locations to what you would expect to see in you Meteor. At the time of this writing, Firebase Messaging Android plugin is at 20.0.0. That didn't work with Gradle 4.10 and cordova-push-plugin. To avoid any issues, and if you're not targetting AndroidX or other complexities, just use the versions suggested in this repo, withing the gradle related files.

Under /app/.meteor/local/cordova-build/platforms/android/app you need to have a google-service.json file.

In ..cordova-build/platforms/android/project.properties make sure you have the latest versions or fairly new. Initially this will have generic versions or "+" versions (see file in the repo)

In ..platforms/android/build.gradle and everywhere else, you can replace
```
maven {
            url "https://maven.google.com"
        }
```
with google(). This replacement covers Gradle 4.1+

In this repo you may find copies of the most import files with relevance for Android so you can have as a comparison.

Gradle used: 4.10.2
Follow this discussion in case you are unable to move up from 4.1 or older [https://stackoverflow.com/questions/49321000/minimum-supported-gradle-version-is-4-1-current-version-is-3-3](here)

```
platforms/android/app/build.gradle
platforms/android/cordova/lib/builders/GradleBuilder.js
platforms/android/cordova/lib/builders/StudioBuilder.js
platforms/android/build.gradle
In /android/app/build.gradle find this part of the code.

task wrapper(type: Wrapper) {
    gradleVersion = '4.10.2'
}

In GradleBuilder.js find this part of the code:
var distributionUrl = process.env['CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL'] || 'https\\://services.gradle.org/distributions/gradle-4.10.2-all.zip';

In StudioBuilder.js find this part of the code:
 var distributionUrl = process.env['CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL'] || 'https\\://services.gradle.org/distributions/gradle-4.10.2-all.zip';
In last file /android/build.gradle we change the following line to actual version. 
classpath 'com.android.tools.build:gradle:3.3.2'
```
You can also set your prefered Gradle version by running the next command before runnign Meteor:
``` export CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL=https\://services.gradle.org/distributions/gradle-4.10.1-all.zip```


## About:
The code is linted with Standard.

If you are looking for premium support for this implementation or particular features, please drop a message.

This was tested with:
* Meteor 1.8.1 - 1.10.2
* cordova 8.1.1
* cordova-ios 4.5.5
* cordova-android 7.1.1, cordova-android 7.1.4
* firebase-admin: 8.6.1
* phonegap-plugin-push 2.3.0 (fixes the IOS 13 change of tokens issue)
* cordova-plugin-device 2.0.2


Google release notes for libraries used by activitree:push:

https://firebase.google.com/support/release-notes/admin/node
https://firebase.google.com/support/release-notes/js