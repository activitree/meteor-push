meteor add activitree:push


(Will add everything here and then sort out the information)
All suggested are what worked in testing but you are free to change everything indeed.
The Android and IOS ware succesfuly built with Meteor. I mention this because before 1.8.1 I could only build this with Android Studio.

# IOS
After IOS Build, go to /app/.meteor/local/cordova-build/platforms/ios and (if you use Terminal) run 'pod install'. After this, in XCode, update the IOS version for each and every pod installed.

# Android
On the first build it will eventually fail due to wrong/inadequate Gradle configuration. However the first build is necessary in order to build the files we are going to work with.

Under /app/.meteor/local/cordova-build/platforms/android/app you need to have a google-service.json file.

In ..cordova-build/platforms/android/project.properties make sure you have the latest versions or fairly new. Initially this will have generic versions or "+" versions

What worked in tests:

```
# Project target.
target=android-27
android.library.reference.1=CordovaLib
android.library.reference.2=app
cordova.system.library.1=com.google.android.gms:play-services-auth:16.0.1
cordova.system.library.2=com.google.android.gms:play-services-identity:16.0.0
cordova.system.library.3=com.android.support:support-v13:27.1.1
cordova.system.library.4=me.leolin:ShortcutBadger:1.1.22@aar
cordova.system.library.5=com.google.firebase:firebase-messaging:17.3.3
cordova.gradle.include.1=phonegap-plugin-push/activitree-push.gradle
cordova.gradle.include.2=cordova-plugin-meteor-webapp/activitree-build-extras.gradle
cordova.system.library.6=com.squareup.okhttp3:okhttp:3.9.1
cordova.gradle.include.3=cordova-android-support-gradle-release/activitree-cordova-android-support-gradle-release.gradle
cordova.system.library.7=com.android.support:support-v4:24.1.1+
cordova.system.library.8=com.facebook.android:facebook-android-sdk:4.40.0
cordova.system.library.9=com.android.support:support-v4:24.1.1+
cordova.system.library.10=com.android.support:support-v4:26.+
cordova.system.library.11=com.android.support:appcompat-v7:26.+
cordova.system.library.12=com.squareup.okhttp3:okhttp:3.12.0
```
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


The coded is linted with Standard.

# Meteor Push Notifications with APN (IOS) and Firebase Admin for Android
This can be branched out with separate versions to run both IOS and Android via Firebase Admin.

## About:
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

## Prerequisites:

* Create an Apple p8 certificate: https://developer.clevertap.com/docs/how-to-create-an-ios-apns-auth-key
* Create an Firebase project and generate a google-services.json file. The Firebase project is supposed to generate a Messeging API in Google Console.

## To do
* At the time of this input, raix:eventstate@0.0.4 is expected to have an update. Raix is pending a push to Atmosphere.
* Add notifications for browser. This module has been completely removed when this package was born out of RAIX:Push. So ... need to put back browser notifications. Also check the compatibility/integration with PWA workers.
* Review code quality and logic. The author (myself) is not an expert but ... working on it.
* Add testing.
* Get a partner or more for the branch and merge administration.
* https://github.com/node-apn/node-apn - the "APN" node packge used here, lacks maintenace, possibly fork and update dependencies.
* The last Production test was done with phonegap-plugin-push@2.1.2. We were stuck here due to cordova-adnroid@6.4.0 built in Meteor.Meteor 1.8.1 has moved to cordova-android 7.1+ so we can access the latest phonegap-plugin-push@2.2.3



