// Helper dinámico para trabajar con Notifee sin romper compilación si el paquete
// no está instalado. Importa Notifee dinámicamente en runtime.
import { Platform } from 'react-native'

type RecordatorioRef = {
  id_recordatorio: number
  fecha_aviso: string
  hora: string
  mensaje?: string | null
}

async function getNotifee() {
  try {
    // use require to avoid static import errors when package missing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const notifee = require('@notifee/react-native')
    return notifee
  } catch (e) {
    throw new Error('@notifee/react-native no está instalado. Instala con `npm install @notifee/react-native`')
  }
}

export async function initNotifications() {
  try {
    const notifee = await getNotifee()
    if (Platform.OS === 'android') {
      // Create a HIGH importance channel so notifications can show as
      // heads-up and play sound by default.
      await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: notifee.AndroidImportance.HIGH,
        sound: 'default',
      })
    }
  } catch (e) {
    console.warn('initNotifications: notifee no disponible', e)
  }
}

export type ScheduleOptions = {
  repeatFrequency?: any
  alarmManager?: boolean
  allowWhileIdle?: boolean
}

export async function scheduleNotification(recordatorio: RecordatorioRef, notificationId?: string, opts?: ScheduleOptions): Promise<string> {
  const notifee = await getNotifee()
  // ensure the channel is created with desired importance/sound
  if (Platform.OS === 'android') {
    try {
      await notifee.createChannel({
        id: 'default',
        name: 'Default',
        importance: notifee.AndroidImportance.HIGH,
        sound: 'default',
      })
    } catch (e) {
      // ignore
    }
  }

  // Android 12+ (and platform restrictions) require the exact alarm permission
  // for timestamp triggers. Check the notification settings to ensure alarms
  // are enabled; if not, signal the caller so they can inform the user and
  // open the system settings.
  if (Platform.OS === 'android') {
    try {
      if (typeof notifee.getNotificationSettings === 'function') {
        const settings = await notifee.getNotificationSettings()
        const alarmSetting = settings?.android?.alarm
        if (alarmSetting !== notifee.AndroidNotificationSetting.ENABLED) {
          const err: any = new Error('ALARM_PERMISSION_REQUIRED')
          err.code = 'ALARM_PERMISSION_REQUIRED'
          throw err
        }
      }
    } catch (e) {
      // Propagate the error to caller to handle UI & settings flow
      throw e
    }
  }

  const [y, m, d] = recordatorio.fecha_aviso.split('-').map((n) => Number(n))
  const [hh, mm] = recordatorio.hora.split(':').map((n) => Number(n))
  const date = new Date(y, m - 1, d, hh, mm, 0)

  const now = Date.now()
  if (date.getTime() <= now) {
    // If the scheduled time is in the past or now, show immediately
    const immediate = {
      title: 'Recordatorio',
      body: recordatorio.mensaje ?? 'Tienes un recordatorio',
      android: { channelId: 'default', smallIcon: 'ic_launcher', sound: 'default' },
      ios: { sound: 'default' },
      data: { id_recordatorio: String(recordatorio.id_recordatorio) },
    }
    try {
      const id = await notifee.displayNotification(immediate)
      return String(id ?? `${recordatorio.id_recordatorio}-${Date.now()}`)
    } catch (e) {
      // fallback
      return `${recordatorio.id_recordatorio}-${Date.now()}`
    }
  }

  const trigger: any = {
    type: notifee.TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  }

  // Apply options if provided
  if (opts?.repeatFrequency) trigger.repeatFrequency = opts.repeatFrequency
  if (opts?.alarmManager) trigger.alarmManager = opts.alarmManager
  if (opts?.allowWhileIdle && opts.alarmManager) {
    trigger.alarmManager = { allowWhileIdle: true }
  }

  const notification: any = {
    title: 'Recordatorio',
    body: recordatorio.mensaje ?? 'Tienes un recordatorio',
    android: { channelId: 'default', smallIcon: 'ic_launcher', sound: 'default' },
    ios: { sound: 'default' },
    data: { id_recordatorio: String(recordatorio.id_recordatorio) },
  }
  if (notificationId) {
    // when an id is provided, createTriggerNotification will update existing trigger
    notification.id = String(notificationId)
  }

  // If the Notifee runtime does not support trigger notifications
  // (e.g. running inside Expo Go or older binaries), fall back to
  // showing an immediate notification and return a generated id.
  if (typeof notifee.createTriggerNotification !== 'function') {
    console.warn('createTriggerNotification not available; falling back to immediate display')
    try {
      const displayed = await notifee.displayNotification(notification)
      return String(displayed ?? `${recordatorio.id_recordatorio}-${Date.now()}`)
    } catch (e) {
      // fallback id
      return `${recordatorio.id_recordatorio}-${Date.now()}`
    }
  }
  // createTriggerNotification returns an id (string) in notifee
  const id = await notifee.createTriggerNotification(notification, trigger)
  return id
}

export async function cancelNotification(notificationId: string) {
  try {
    const notifee = await getNotifee()
    // cancel both scheduled trigger and notification
    // cancel trigger first (if supported), then active notification
    if (typeof notifee.cancelTriggerNotification === 'function') {
      try {
        await notifee.cancelTriggerNotification(notificationId)
      } catch (e) {
        // ignore
      }
    }
    try {
      await notifee.cancelNotification(notificationId)
    } catch (e) {
      // ignore
    }
  } catch (e) {
    console.warn('cancelNotification: notifee no disponible o error', e)
  }
}

export async function getTriggerNotificationIds(): Promise<string[]> {
  try {
    const notifee = await getNotifee()
    if (typeof notifee.getTriggerNotificationIds === 'function') {
      const ids = await notifee.getTriggerNotificationIds()
      return ids ?? []
    }
    return []
  } catch (e) {
    console.warn('getTriggerNotificationIds: notifee no disponible', e)
    return []
  }
}

export async function cancelTriggerNotifications(): Promise<void> {
  try {
    const notifee = await getNotifee()
    if (typeof notifee.cancelTriggerNotifications === 'function') {
      await notifee.cancelTriggerNotifications()
    }
  } catch (e) {
    console.warn('cancelTriggerNotifications: notifee no disponible', e)
  }
}

/**
 * Indica si la API de trigger (createTriggerNotification) está disponible
 * en el runtime actual. Devuelve `true` sólo si el módulo native de Notifee
 * está presente y expone la función necesaria.
 */
export async function supportsTrigger(): Promise<boolean> {
  try {
    const notifee = await getNotifee()
    return typeof notifee.createTriggerNotification === 'function'
  } catch (e) {
    return false
  }
}

export async function openAlarmPermissionSettings() {
  try {
    const notifee = await getNotifee()
    if (typeof notifee.openAlarmPermissionSettings === 'function') {
      await notifee.openAlarmPermissionSettings()
      return true
    }
    return false
  } catch (e) {
    console.warn('openAlarmPermissionSettings: notifee no disponible', e)
    return false
  }
}

export default {
  initNotifications,
  scheduleNotification,
  cancelNotification,
}
