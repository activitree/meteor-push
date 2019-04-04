This is under development. Some things are missing from this repo.
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

## To do
* At the time of this input, raix:eventstate@0.0.4 is expected to have an update. Raix is pending the push to Atmosphere.
* Test with 1.8.1 and the latest NPM versions contained in the repo
* Add notifications for browser. This module has been completely removed when this package was born out of RAIX:Push. So ... need to put back browser notifications. Also check the compatibility/integration with PWA workers.
* Review code quality and logic. The author (myself) is not an expert but ... working on it.
* Add testing.
* Get a partner or more for the branch and merge administration.

