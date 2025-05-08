import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.faducardgame',
  appName: 'Fadu Card Game',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2196f3",
      showSpinner: true,
      spinnerColor: "#ffffff",
      androidSplashResourceName: "splash"
    },
    StatusBar: {
      backgroundColor: "#2196f3",
      style: "DARK",
      overlaysWebView: false
    }
  }
};

export default config;