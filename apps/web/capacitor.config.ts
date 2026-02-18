import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.bitcoinbaby.app",
  appName: "BitcoinBaby",
  webDir: "out",
  server: {
    // For local development, uncomment these lines:
    // url: "http://localhost:3000",
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
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
    // SECURITY: Mixed content disabled for production (HTTPS only)
    allowMixedContent: false,
    captureInput: true,
    // SECURITY: Debug disabled for production builds
    webContentsDebuggingEnabled: process.env.NODE_ENV === "development",
  },
};

export default config;
