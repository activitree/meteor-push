# Meteor Push Notifications with APN (IOS) and Firebase Admin for Android

This is a stripped-down Push-Plugin for Meteor Cordova Apps for Android and iOS. If that is what you have got, 
this package wants to help you send push notifications to your Cordova-Clients. 

In the future the package may be extended to support Push via Firebase Admin for iOS too, as well as web-push-notifications.

Right now it *doesn't* support web push and supports iOS Push only via APN. 

Unfortunately at the moment fully automated builds for iOS and Android are not possible (as far as we know).

Thus a certain amount of manual fiddling with each build will have to happen on each build.

We'll do our best to support you in this endeavour.

If you have any feedback or would like to help flesh out this package please feel free to create an issue or contact the author. 

## About:
This is a re-write of [raix:push](https://github.com/raix/push).

This was tested with:
Custom Meteor:
* Meteor 1.7.0.5, Meteor 1.8.0.1, Meteor 1.8.0.2 + cordova-phonegap-plugin-push 2.1.2 - both IOS and Android receive notifications.
* Meteor 1.8.1 + cordova-phonegap-plugin-push 2.1.2 and phonegap-plugin-push 2.2.3 - both IOS and Android receive notifications.
* cordova 8.1.1
* cordova-ios 4.5.5
* cordova-android 6.4.0, cordova-android 7.1.4
* node-apn 2.2.0
* firebase-admin 7.2.0


## Prerequisites:

* Create an Apple p8 certificate: https://developer.clevertap.com/docs/how-to-create-an-ios-apns-auth-key
* Create an Firebase project and generate a google-services.json file. The Firebase project is supposed to generate a Messaging API in Google Console (See png files in the Example folder).
  * If it is the first time you use the Firebase Cloud Messaging API(TM) for your app, you need to "activate" the the API by visiting here: `https://console.developers.google.com/apis/api/fcm.googleapis.com/overview?project=<YOUR_PROJECT_ID>`. It may take a few minutes until it's ready but it sholdn't take long.

* Get your firebase server account credentials:https://console.firebase.google.com/project/**YOUR_PROJECT**/settings/serviceaccounts/adminsdk
  * This explains how to create + download your key (it's not hard): https://stackoverflow.com/a/40799378

## Installation

    meteor add activitree:push

Included / referenced in the meteor package are the following cordova packages:

    phonegap-plugin-push@2.2.3
    cordova-plugin-device@2.0.2
    cordova-android-support-gradle-release@1.4.5 

(at the time of writing, those are the included & tested versions)

...so you won't have to add them to your `.meteor/cordova-plugins` - file and you may indeed remove any previous push packages from there.  

## *Very Important*: The example directory

As we don't have the full integration docs yet, you should go through the /example/ - folder of this repository and make
sure you have something similar / corresponding for each folder of the example app.

All the settings are what worked in testing but you are of course free to change things around to best fit your project.

The Android and iOS - Apps were successfully built with meteor and the shown example configuration from the `/example` -
subdirectory of this repo.

### What's included in the example:

    app/
        .meteor/
            local/                  Here you will have a half-complete android-build you'll want to work with.
                                    Further down in the "Android" - section we'll explain what to do here to build the
                                    Android app.
                                    
                                    The files included here show (some build files of ) a real-world configuration of 
                                    an android build which supposedly actually did run *at least* once in the wild :).

        client/
            client.js               This is example code from a real project. It basically shows how a client app 
                                    calls a server method which then in turn will send the push message.
                                    
                                    The method will be defined further down in the example. 
             
        cordova-build-override/     This is a special meteor folder from which stuff will be copied into the cordova 
            google-services.json    projects after they have been created but not built. I am not an expert on that, so 
                                    for now just put your google-services.json - file here while building the android app.
                                    
                                    The Android build process will read (and maybe include it into the build?) this to
                                    configure the Android app to receive Push notifications from your Firebast account.
                                    
                                    And that's really what it's all about in the end, isn't it? :)   
                                     
        lib/
            push_methods.js         This defines the method which actually sends the Push from the server to the correct
                                    users' device. Take what you need and run :)
                                    
        server/
            private/
                serviceAccount.js   This is the serviceAccount - data from your google firebase account. It is included
                                    by `/startup/server.js` so you could put it anywhere you like.
                                    
                                    *NOTE:* I would recommend not commiting this file to your repository, ever, in case
                                    somebody else might get access to it in the future and/or you use a public version
                                    control service... I myself put this in my Meteor Settings and set them using a 
                                    environment variable on the server. For nginx: \\n does work to add newlines to 
                                    strings / encryption keys in the nginx config... 
                                    
                                    Anyways. You need to be able to supply this data to the server init call later on.
                
        startup/
            client/
                index.js            Put your client startup code here. This'll run on startup on your cordova app once.
                                    It'll allow us to store the devices push token in the server - database once
                                    the device finds it as well as associate it with a user.
                                    
                                    Furthermore you can set up defaults for the sending of... Push local notifications here?
                                    
                                    I don't know what it's for to be honest, I don't think it's used right now... (@Paul?)
                                    
                                    ANYWAYS initialize your clients like this! :)
                                    
            server/
                index.js            Here you provide the push package with all your precious secret information - 
                                    AKA push keys & auth certificates for iOS + Android - and you can set defaults here
                                    for your notifications as well as configure the package some more.
                                    
                                    In the future we hope to provide further valuable info about what the params do, but
                                    feel free to cross-reference the plugin and [phonegap-plugin-push](https://github.com/phonegap/phonegap-plugin-push)
                                    and let us know what you find out. :)
                                                    
        mobile-config.js            This, as you probably already know, contains build information for your mobile builds.
        
                                    The only thing we do here is to copy the google-services.json - file from the 
                                    `cordova-build-override` - folder (see above) into the Android build directory.
                                    
                                    As I said above I am not sure how well this works right now, as we find out more 
                                    we'll continue improving this package + the docs... :) Nice of us, eh? :)
                                    
        
        scripts_meteor_package_json     This are examples you can use in your own apps' package.json - file to make
                                        building the apps easier for yourself.



##

Building the Cordova Apps

### IOS

After the IOS Build, go to either 

    /app/.meteor/local/cordova-build/platforms/ios 
    
or your build-folder 

    /build/ios/project/

and (if you use the Terminal) run `pod install` to install required dependencies for the project.

After this, in XCode, update the iOS version for each and every pod installed. (Note Daniel: I am not sure if this is really necessary?)
-> check this image on how to do that if you want to: [Update Pod iOS Versions](docs/images/Xcode%20Pods.png)

Sound files for custom notification sounds: Keep rather short, .CAF extension and added in XCode directly under resources. When you drop them, confirm (check) "Add to targets".

### Android

On the first build it will eventually fail due to wrong/inadequate Gradle configuration. However the first build is necessary in order to build the files we are going to work with.

*Note Daniel 2019-06-05 : Actually I think my project builds now without the interruption if I make sure to have the `google-services.json` copied to the right place using the `mobile-config.js` App.appendToConfig - trick as seen in the example app (?).
If that doesn't work, follow the steps below.*

This repo contains sample files of configurations that worked in testing. You will find the files at a similar locations to what you would expect to see in Meteor.

*Hint Daniel:* I would recommend that after you found a set of files that worked for you, store a copy of each file, in a directory with the same relative positions as
in the build directory, so you can just copy them over after you found a config that worked.

*Note*: Cordova/Android Build isn't entirely my area of expertise, so if you have any ideas to make this part of the documentation
clearer + more helpful please feel free to let us know in the Issue Tracker or via a pull request! We'd be happy to make this easier in the future.  

In the Android build directory, eg. `/your-app/.meteor/local/cordova-build/platforms/android` , you'll have to do some edits.

As recommended above, make a copy of the changed files after you found a working version (you'll find the working files in your `build` - output directory once the build succeeded). 
      
This is the structure of the relevant folders + the changes you'll have to make.

These are the files, we'll go through them one-by-one below:

    your-app/.meteor/local/cordova-build/platforms/android/
        
        app/
            build.gradle                            
            google-services.json        
   
        /lib
            /builders
                GradleBuilder.js
                StudioBuilder.js
                
        build.gradle
        project.properties
            

(From now on in this section, all paths are relative to `your-app/.meteor/local/cordova-build/platforms/android/`):
            
In the two `build.gradle` - files, you can replace
  
    maven {
        url "https://maven.google.com"
    }
 
with 
    
    google()
    
. This replacement covers Gradle 4.1+

Under `/app` you need to have *your* `google-service.json` file.

In `project.properties` make sure you have the latest versions or fairly new. Initially this will have generic versions or "+" versions (see file in the repo).

*NOTE: I think we should describe this part further.* 

In this repo you may find copies of the most import files with relevance for the Android build so you can use it for comparison.

Gradle used: 4.10.2

Follow this discussion in case you are unable to move up from 4.1 or older [https://stackoverflow.com/questions/49321000/minimum-supported-gradle-version-is-4-1-current-version-is-3-3](here)

In `/app/build.gradle` find this part of the code:

    task wrapper(type: Wrapper) {
        gradleVersion = '4.10.2'
    }

and change the `gradleVersion` to `4.10.2` if it isn't already.


In both `GradleBuilder.js` and `StudioBuilder.js` look for this code + change the gradle version to `gradle-4.10.2-all.zip`.

    var distributionUrl = process.env['CORDOVA_ANDROID_GRADLE_DISTRIBUTION_URL'] || 'https\\://services.gradle.org/distributions/gradle-4.10.2-all.zip';

In the last file, the `build.gradle` in the root of the build directory, we change the following line to the version `3.3.2`:
 
    classpath 'com.android.tools.build:gradle:3.3.2'


After you have done all that, you can try to start the build again + if everything is ok it should finish the build this time.


## To do

* Add notifications for browser. This module has been completely removed when this package was born out of `raix:push`. So ... need to put back browser notifications. Also check the compatibility/integration with PWA workers.
* Review code quality and logic. The author (myself) is not an expert but ... working on it.
* Add testing.
* Get a partner or more for the branch and merge administration.
* https://github.com/node-apn/node-apn - the "APN" node packge used here, lacks maintenace, possibly fork and update dependencies.
* The last Production test was done with phonegap-plugin-push@2.1.2. We were stuck here due to cordova-android@6.4.0 built in Meteor.Meteor 1.8.1 has moved to cordova-android 7.1+ so we can access the latest phonegap-plugin-push@2.2.3 from then on.
