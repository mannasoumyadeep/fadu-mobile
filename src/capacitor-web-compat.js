// Mock Capacitor API implementations for web-only environments
// This file provides fallback implementations when the app is running on the web

export const Capacitor = {
  isNativePlatform: () => false,
  getPlatform: () => 'web'
};

export const Haptics = {
  impact: () => Promise.resolve(),
  notification: () => Promise.resolve()
};

export const CapApp = {
  addListener: () => ({ remove: () => {} }),
  exitApp: () => {}
};

export const Storage = {
  get: () => Promise.resolve({ value: null }),
  set: () => Promise.resolve(),
  remove: () => Promise.resolve()
};

export const StatusBar = {
  setBackgroundColor: () => Promise.resolve(),
  setStyle: () => Promise.resolve()
};
