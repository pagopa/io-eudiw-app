package com.ioeudiwapp
import expo.modules.ReactActivityDelegateWrapper

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import com.zoontek.rnbootsplash.RNBootSplash // Required by react-native-bootsplash

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "IoEudiwApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled))

  
  override fun onCreate(savedInstanceState: Bundle?) {
      RNBootSplash.init(this, R.style.BootTheme)  // Required by react-native-bootsplash, initialize the splash screen
      /**
        * This is required by react-native-screen. It discards any Activity state persisted during the Activity restart process,
        * to avoid inconsistencies that lead to crashes as in Android view state is not persisted consistently across Activity restarts.
      */
      super.onCreate(null)
  }
}
