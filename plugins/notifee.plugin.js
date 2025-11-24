const { withAndroidManifest } = require('@expo/config-plugins')

/**
 * Minimal Expo config plugin for @notifee/react-native
 * - Adds Android POST_NOTIFICATIONS permission (API 33+)
 * - Leaves more complex Notifee setup to manual native steps (or official plugin)
 */
module.exports = function withNotifee(config) {
  return withAndroidManifest(config, (cfg) => {
    try {
      const manifest = cfg.modResults
      if (!manifest || !manifest.manifest) return cfg

      const uses = manifest.manifest['uses-permission'] || []

      const hasPostNotifications = uses.some((p) => {
        return p && p.$ && (p.$['android:name'] === 'android.permission.POST_NOTIFICATIONS')
      })

      if (!hasPostNotifications) {
        uses.push({
          $: { 'android:name': 'android.permission.POST_NOTIFICATIONS' },
        })
      }

      manifest.manifest['uses-permission'] = uses
      cfg.modResults = manifest
      return cfg
    } catch (e) {
      console.warn('withNotifee plugin skipped: ', e)
      return cfg
    }
  })
}
