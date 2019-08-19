# Meteor Push Notifications with APN (IOS) and Firebase Admin for Android
This can be branched out with separate versions to run both IOS and Android via Firebase Admin.

## Prerequisites:

* Create an Apple p8 certificate: https://developer.clevertap.com/docs/how-to-create-an-ios-apns-auth-key
* Create an Firebase project and generate a google-services.json file. The Firebase project is supposed to generate a Messaging API in Google Console.(See png files in the Example folder)
* Get a firebase server account: https://stackoverflow.com/questions/40799258/where-can-i-get-serviceaccountcredentials-json-for-firebase-admin/40799378
Or visit here: https://console.firebase.google.com/project/**YOUR_PROJECT**/settings/serviceaccounts/adminsdk

meteor add activitree:push


(Will add everything here and then sort out the information)

All settings suggested are what worked in testing but you are free to change everything indeed.
The Android and IOS ware succesfuly built with Meteor. I mention this because before 1.8.1 I could only build Android with Android Studio.

# IOS
After IOS Build, go to /app/.meteor/local/cordova-build/platforms/ios and (if you use Terminal) run 'pod install'. After this, in XCode, update the IOS version for each and every pod installed.

# Android
On the first build it will eventually fail due to wrong/inadequate Gradle configuration. However the first build is necessary in order to build the files we are going to work with.

This repo contains sample files of configurations that worked in testing. You will find the files at a similar locations to what you would expect to see in Meteor.

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

## About:
The coded is linted with Standard.
This is a re-write of RAIX:PUSH.
The coded is linted with Standard.

This was tested with:
Custom Meteor:
* Meteor 1.7.0.5, Meteor 1.8.0.1, Meteor 1.8.0.2, Meteor 1.8.1
* cordova 8.1.1
* cordova-ios 4.5.5
* cordova-android 7.1.1, cordova-android 7.1.4
* node-apn 2.2.0
* firebase-admin 6.0.0, firebase-admin 7.2.0
* phonegap-plugin-push 2.1.2, phonegap-plugin-push 2.2.3 
* cordova-plugin-device 2.0.2

## To do
* Add notifications for browser. This module has been completely removed when this package was born out of RAIX:Push. So ... need to put back browser notifications. Also check the compatibility/integration with PWA workers.
* Review code quality and logic. The author (myself) is not an expert but ... working on it.
* Add testing.
* Get a partner or more for the branch and merge administration.
* https://github.com/node-apn/node-apn - the "APN" node packge used here, lacks maintenace, possibly fork and update dependencies.
* The last Production test was done with phonegap-plugin-push@2.1.2. We were stuck here due to cordova-adnroid@6.4.0 built in Meteor.Meteor 1.8.1 has moved to cordova-android 7.1+ so we can access the latest phonegap-plugin-push@2.2.3.
Presently still set on 2.1.2 for compatibility with Meteor < 1.8.1.



