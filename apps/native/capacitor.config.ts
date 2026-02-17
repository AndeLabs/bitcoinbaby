import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.bitcoinbaby.app",
  appName: "BitcoinBaby",
  webDir: "out",
  server: {
    // For development, use local server
    // url: "http://localhost:3000",
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f0f1b",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0f0f1b",
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
  ios: {
    contentInset: "automatic",
    scheme: "BitcoinBaby",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
