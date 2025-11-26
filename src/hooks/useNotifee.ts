import { Alert } from 'react-native'
import showToast from '../utils/toast'
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

    // Validación: la fecha debe ser futura
    try {
      if (!opts?.date || !(opts.date instanceof Date) || opts.date.getTime() <= Date.now()) {
        showToast('El recordatorio debe programarse en una fecha y hora futuras.')
        console.log('useNotifee.scheduleTrigger -> fecha inválida, debe ser futura', opts?.date)
        return null
      }
    } catch (e) {
      // en caso de tipos inesperados, abortar con toast
      showToast('El recordatorio debe programarse en una fecha y hora futuras.')
      console.warn('useNotifee.scheduleTrigger -> error validando fecha', e)
      return null
    }

    // Verificar ajustes/permisos antes de programar: si no están habilitados, pedir al usuario
    try {
      const settings = await getNotificationSettings()
      const s: any = settings
      // Interpretar distintos formatos: algunos campos vienen como enums/nums (0/1) y otros como strings
      const authGranted = s
        ? typeof s.authorizationStatus === 'number'
          ? s.authorizationStatus === 1
          : s.authorizationStatus === 'granted'
        : false
      const alarmFlag = s?.android?.alarm ?? s?.alarm
      const alarmGranted = alarmFlag === true || alarmFlag === 1
      const permissionDenied = !(authGranted && alarmGranted)
      if (permissionDenied) {
        // Mostrar Alert y esperar la respuesta del usuario (resuelve Promise)
        const openSettings = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Permitir alarmas y recordatorios',
            'La app necesita permiso para programar alarmas y recordatorios. ¿Abrir configuración?',
            [
              { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Abrir configuración', onPress: () => resolve(true) },
            ],
            { cancelable: true, onDismiss: () => resolve(false) },
          )
        })

        if (!openSettings) {
          console.log('useNotifee.scheduleTrigger -> usuario canceló habilitar permisos')
          return null
        }

        // Abrir ajustes y esperar que el usuario conceda permiso (polling con timeout)
        console.log('useNotifee.scheduleTrigger -> abriendo ajustes de alarmas')
        await openAlarmPermissionSettings()

        // Wait for the user to grant permission after opening settings.
        // Limit waiting to a few seconds to avoid long 'loading' hangs in the UI.
        const waitForGrant = async (timeoutMs = 8_000, intervalMs = 1000) => {
          const start = Date.now()
          while (Date.now() - start < timeoutMs) {
            try {
              const s: any = await getNotificationSettings()
              if (s) {
                const granted = s.authorizationStatus === 'granted' || s.areNotificationsEnabled === true || s.alarm === true
                if (granted) return true
              }
            } catch (e) {
              // ignore and retry
            }
            await new Promise((r) => setTimeout(r, intervalMs))
          }
          return false
        }

        const granted = await waitForGrant()
        if (!granted) {
          console.log('useNotifee.scheduleTrigger -> permiso no concedido tras abrir ajustes')
          return null
        }
        console.log('useNotifee.scheduleTrigger -> permiso concedido tras abrir ajustes, continúo')
      }
    } catch (e) {
      console.warn('scheduleTrigger: error comprobando permisos', e)
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
