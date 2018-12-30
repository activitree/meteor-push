DO NOT USE. This is under development. Client and server side code (startup config and methods) and documentation are missing from this repo.
Documentation Updates WIP

# Meteor Push Notifications with APN (IOS) and Firebase Admin for Android
This can be branched out with separate versions to run both IOS and Android via Firebase Admin.
Due to the complexity on the Android side, this package requires the build of Cordova Android with Android Studio.

## About:
This is a re-write of RAIX:PUSH.
This was tested with:

Custom Meteor:
* Meteor 1.7.0.5
* cordova 8.1.1
* cordova-ios 4.5.5
* cordova-android 7.1.1
* node-apn 2.2.0
* firebase-admin 6.0.0
* phonegap-plugin-push 2.2.3
* cordova-plugin-device 2.0.2

Presently running in production with:
* Default Meteor 1.8.0.1
* node-apn 2.2.0
* firebase-admin 6.4.0
* phonegap-plugin-push 2.1.2
* cordova-plugin-device 2.0.2

## Prerequisites:

* Create an Apple p8 certificate: https://developer.clevertap.com/docs/how-to-create-an-ios-apns-auth-key
* Create an Firebase project and generate a google-services.json file
