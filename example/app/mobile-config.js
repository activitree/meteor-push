/* globals App */
/* eslint-disable quote-props */

App.info({
  // xxxxxxxxxx
})

App.icons({
  // iOS
  'app_store': 'resources/icons/icon-1024.png',
  'iphone_2x': 'resources/icons/icon-120.png',
  'iphone_3x': 'resources/icons/icon-180.png',
  'ipad_2x': 'resources/icons/icon-152.png',
  'ipad_pro': 'resources/icons/icon-167.png',
  'ios_settings_2x': 'resources/icons/icon-58.png',
  'ios_settings_3x': 'resources/icons/icon-87.png',
  'ios_spotlight_2x': 'resources/icons/icon-80.png',
  'ios_spotlight_3x': 'resources/icons/icon-120.png',
  'ios_notification_2x': 'resources/icons/icon-40.png',
  'ios_notification_3x': 'resources/icons/icon-60.png',
  // Legacy
  'ipad': 'resources/icons/icon-76.png',
  'ios_settings': 'resources/icons/icon-29.png',
  'ios_spotlight': 'resources/icons/icon-40.png',
  'ios_notification': 'resources/icons/icon-20.png',
  'iphone_legacy': 'resources/icons/icon-57.png',
  'iphone_legacy_2x': 'resources/icons/icon-114.png',
  'ipad_spotlight_legacy': 'resources/icons/icon-50.png',
  'ipad_spotlight_legacy_2x': 'resources/icons/icon-100.png',
  'ipad_app_legacy': 'resources/icons/icon-72.png',
  'ipad_app_legacy_2x': 'resources/icons/icon-144.png',

  // Android
  'android_mdpi': 'resources/icons/android/icon-48.png',
  'android_hdpi': 'resources/icons/android/icon-72.png',
  'android_xhdpi': 'resources/icons/android/icon-96.png',
  'android_xxhdpi': 'resources/icons/android/icon-144.png',
  'android_xxxhdpi': 'resources/icons/android/icon-192.png'
})

App.launchScreens({
  // iOS
  'iphone5': 'resources/splash/splash-640x1136.png',
  'iphone6': 'resources/splash/splash-750x1334.png',
  'iphone6p_portrait': 'resources/splash/splash-1242x2208.png',
  'iphoneX_portrait': 'resources/splash/splash-1125x2436.png',
  'ipad_portrait_2x': 'resources/splash/splash-1536x2048.png',
  // Legacy
  'iphone_2x': 'resources/splash/splash-640x960.png',
  'ipad_portrait': 'resources/splash/splash-768x1024.png',

  // Android
  'android_hdpi_portrait': 'resources/splash/splash-480x854.png',
  'android_xhdpi_portrait': 'resources/splash/splash-720x1280.png',
  'android_xxhdpi_portrait': 'resources/splash/splash-960x1600.png',
  'android_xxxhdpi_portrait': 'resources/splash/splash-1280x1920.png'
})

App.setPreference('android-targetSdkVersion', '26')
App.setPreference('android-minSdkVersion', '21')
App.setPreference('StatusBarOverlaysWebView', 'true')
App.setPreference('StatusBarStyle', 'lightcontent')
App.setPreference('Orientation', 'portrait')
// App.setPreference('StatusBarBackgroundColor', '#111')
App.setPreference('KeyboardDisplayRequiresUserAction', 'false')

App.setPreference('SplashMaintainAspectRatio', 'true') // Android
App.setPreference('ShowSplashScreenSpinner', 'false') // IOS
App.setPreference('iosPersistentFileLocation', 'Library') // IOS
App.setPreference('DisallowOverscroll', 'true') // IOS
App.setPreference('webviewbounce', 'false')

// Splashscreen is managed by the Meteor package.


App.configurePlugin('cordova-plugin-facebook4', {
  APP_ID: 'xxxxxxx',
  APP_NAME: 'xxxxxxxxx'
})

App.configurePlugin('cordova-plugin-googleplus', {
  'REVERSED_CLIENT_ID': 'com.googleusercontent.apps.xxxxxxxxxxxxxxxx'
})

//****************** Start of relevance for Push if you want to go this way ******************//
//****************** Start of relevance for Push if you want to go this way ******************//

// this is not required if you don't use and override folder. Just place google-service.json in the right place.


App.appendToConfig(`
<platform name="android">
    <resource-file target="google-services.json" src="../../../cordova-build-override/google-services.json"/>
</platform>
`)

//****************** End of relevance for Push ******************//
//****************** End of relevance for Push ******************//


App.appendToConfig(`
<platform name="ios">
  <edit-config target="UIStatusBarHidden" file="*-Info.plist" mode="merge">
      <true/>
  </edit-config>
  <edit-config target="UIViewControllerBasedStatusBarAppearance" file="*-Info.plist" mode="merge">
    <false/>
  </edit-config>
  <edit-config target="AllowInlineMediaPlayback" file="*-Info.plist" mode="merge">
      <true/>
    </edit-config>
</platform>
`)
