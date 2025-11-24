import notifee, { AndroidImportance, TimestampTrigger, TriggerType } from '@notifee/react-native'

const DEFAULT_CHANNEL_ID = 'default'

type ScheduleOptions = {
  title: string
  body?: string
  date: Date
  channelId?: string
  smallIcon?: string
}

export default function useNotifee() {
  async function requestPermission() {
    if (typeof notifee.requestPermission === 'function') {
      const res = await notifee.requestPermission()
      console.log('useNotifee.requestPermission ->', res)
      return res
    }
    return null
  }

  async function ensureChannel() {
    try {
      if (typeof notifee.createChannel === 'function') {
        const channelId = await notifee.createChannel({
          id: DEFAULT_CHANNEL_ID,
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
          sound: 'default',
        })
        console.log('useNotifee.ensureChannel ->', channelId)
        return channelId
      }
    } catch (err) {
      console.warn('ensureChannel error', err)
    }
    return DEFAULT_CHANNEL_ID
  }

  async function getNotificationSettings() {
    if (typeof notifee.getNotificationSettings === 'function') {
      try {
        const settings = await notifee.getNotificationSettings()
        console.log('useNotifee.getNotificationSettings ->', settings)
        return settings
      } catch (err) {
        console.warn('getNotificationSettings error', err)
      }
    }
    return null
  }

  async function openAlarmPermissionSettings() {
    if (typeof notifee.openAlarmPermissionSettings === 'function') {
      try {
        console.log('useNotifee.openAlarmPermissionSettings -> opening')
        await notifee.openAlarmPermissionSettings()
        return true
      } catch (err) {
        console.warn('openAlarmPermissionSettings error', err)
      }
    }
    return false
  }

  async function displayNotification({ title, body, channelId, smallIcon }: { title: string; body?: string; channelId?: string; smallIcon?: string }) {
    try {
      const ch = channelId ?? (await ensureChannel())
      console.log('useNotifee.displayNotification ->', { title, body, channelId: ch, smallIcon })
      if (typeof notifee.displayNotification === 'function') {
        const res = await notifee.displayNotification({
          title,
          body,
          android: { channelId: ch, smallIcon: smallIcon ?? 'ic_launcher' },
        })
        console.log('useNotifee.displayNotification result ->', res)
        return res
      }
    } catch (err) {
      console.warn('displayNotification error', err)
    }
    return null
  }

  async function scheduleTrigger(opts: ScheduleOptions) {
    if (typeof notifee.createTriggerNotification !== 'function') {
      throw new Error('createTriggerNotification not available in this runtime')
    }

    await requestPermission()
    const ch = (await ensureChannel()) || DEFAULT_CHANNEL_ID

    console.log('useNotifee.scheduleTrigger -> scheduling', { title: opts.title, date: opts.date?.toString(), channel: ch })

    // ensure timestamp is in the future
    let timestamp = opts.date.getTime()
    if (timestamp <= Date.now()) {
      timestamp = Date.now() + 30_000
    }

    const trigger: any = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      alarmManager: true,
    }

    try {
      const id = await notifee.createTriggerNotification(
        {
          title: opts.title,
          body: opts.body,
          android: {
            channelId: ch,
            smallIcon: opts.smallIcon ?? 'ic_launcher',
          },
        },
        trigger,
      )
      console.log('useNotifee.scheduleTrigger created id ->', id)
      return id
    } catch (err) {
      console.error('scheduleTrigger error', err)
      throw err
    }
  }

  async function cancelNotification(id?: string) {
    if (!id) return
    try {
      console.log('useNotifee.cancelNotification ->', id)
      if (typeof notifee.cancelTriggerNotification === 'function') {
        await notifee.cancelTriggerNotification(id)
        console.log('useNotifee.cancelNotification -> cancelled via cancelTriggerNotification', id)
        return
      }
      if (typeof notifee.cancelNotification === 'function') {
        await notifee.cancelNotification(id)
        console.log('useNotifee.cancelNotification -> cancelled via cancelNotification', id)
        return
      }
    } catch (err) {
      console.warn('cancelNotification error', err)
    }
  }

  async function getTriggerNotifications() {
    try {
      if (typeof notifee.getTriggerNotifications === 'function') {
        const res = await notifee.getTriggerNotifications()
        console.log('useNotifee.getTriggerNotifications ->', res)
        return res
      }
      if (typeof notifee.getTriggerNotificationIds === 'function') {
        const res = await notifee.getTriggerNotificationIds()
        console.log('useNotifee.getTriggerNotificationIds ->', res)
        return res
      }
    } catch (err) {
      console.warn('getTriggerNotifications error', err)
    }
    return null
  }

  return {
    requestPermission,
    ensureChannel,
    getNotificationSettings,
    openAlarmPermissionSettings,
    displayNotification,
    scheduleTrigger,
    cancelNotification,
    getTriggerNotifications,
  }
}

export type { ScheduleOptions }

// Named exports for convenience in components that want to probe capabilities
export async function supportsTrigger(): Promise<boolean> {
  try {
    return typeof notifee.createTriggerNotification === 'function'
  } catch (e) {
    return false
  }
}

export async function openAlarmPermissionSettings(): Promise<boolean> {
  try {
    if (typeof notifee.openAlarmPermissionSettings === 'function') {
      await notifee.openAlarmPermissionSettings()
      return true
    }
  } catch (e) {
    console.warn('openAlarmPermissionSettings (named) error', e)
  }
  return false
}
