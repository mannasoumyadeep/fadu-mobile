// capacitor.config.js
module.exports = {
    appId: 'com.yourname.faducardgame',
    appName: 'Fadu Card Game',
    webDir: 'build',
    bundledWebRuntime: false,
    plugins: {
      SplashScreen: {
        launchShowDuration: 2000,
        launchAutoHide: true,
        backgroundColor: "#2196f3",
        androidSplashResourceName: "splash",
        androidScaleType: "CENTER_CROP",
        showSpinner: true,
        androidSpinnerStyle: "large",
        spinnerColor: "#ffffff",
      },
      CapacitorHaptics: {
        enabled: true
      },
      StatusBar: {
        style: "dark",
        backgroundColor: "#2196f3"
      }
    },
    android: {
      allowMixedContent: true,
      captureInput: true,
      webContentsDebuggingEnabled: false,
      backgroundColor: "#ffffff",
      overrideUserAgent: false,
      appendUserAgent: "FaduCardGameApp/1.0.0",
      minSdkVersion: 21,
      targetSdkVersion: 31
    }
  };