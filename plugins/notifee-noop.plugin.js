// No-op Expo config plugin for @notifee/react-native
// Purpose: prevent expo prebuild from trying to import Notifee as a config plugin
// and failing on environments where the package doesn't export a valid plugin.
// After prebuild you can follow Notifee's manual native setup instructions.

module.exports = function withNotifeeNoop(config) {
  return config;
};
