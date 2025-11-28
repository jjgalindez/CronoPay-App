import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal, TextInput, Platform, Alert } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import showToast from '../utils/toast'
import { useColorScheme } from 'nativewind'
import DateTimePicker from '@react-native-community/datetimepicker'
import { RecordatorioItem } from './RecordatoriosList'
import useNotifee from '../hooks/useNotifee'
import { updateRecordatorio, deleteRecordatorio } from '../../lib/api/recordatorios'
import { useTranslation } from 'react-i18next'

type Props = {
  visible: boolean
  recordatorio: RecordatorioItem | null
  onClose: () => void
  onUpdated?: (updated: any) => void
  onDeleted?: (id: number) => void
}

export default function RecordatorioEditor({ visible, recordatorio, onClose, onUpdated, onDeleted }: Props) {
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { t } = useTranslation()
  const [fecha, setFecha] = useState<string>('')
  const [hora, setHora] = useState<string>('')
  const [mensaje, setMensaje] = useState<string>('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [programar, setProgramar] = useState<boolean>(false)
  const nf = useNotifee()

  useEffect(() => {
    if (recordatorio) {
      setFecha(recordatorio.fecha_aviso)
      setHora(recordatorio.hora.slice(0,5))
      setMensaje(recordatorio.mensaje ?? '')
      setProgramar(Boolean((recordatorio as any).notification_id))
    }
  }, [recordatorio])

  function buildDateFromFechaHora(fechaStr: string, horaStr: string) {
    // fechaStr expected 'YYYY-MM-DD', horaStr expected 'HH:MM' or 'HH:MM:SS'
    const [y, m, d] = fechaStr.split('-').map(Number)
    const [hh, mm] = horaStr.split(':').map((s) => Number(s))
    // new Date(year, monthIndex, day, hours, minutes)
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0)
  }

  function validate() {
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(fecha)) return t('InvalidDate')
    if (!/^[0-9]{1,2}:[0-9]{2}$/.test(hora)) return t('InvalidTime')
    return null
  }

  async function handleSave() {
    if (!recordatorio) return
    const v = validate()
    if (v) return showToast(v)
    // Validar que la fecha+hora sea futura antes de intentar guardar o programar
    try {
      const dateCheck = buildDateFromFechaHora(fecha, hora)
      if (dateCheck.getTime() <= Date.now()) {
        showToast(t('ReminderMustBeFuture'))
        return
      }
    } catch (e) {
      showToast(t('ReminderMustBeFuture'))
      return
    }

    setSubmitting(true)
    try {
      // If previously scheduled and user turned off, cancel
      const oldNotifId = (recordatorio as any).notification_id ?? null

      // If programar is true, schedule new notification for the (possibly new) date/time
      let newNotifId: string | null = oldNotifId

      if (oldNotifId && !programar) {
        // cancel old
        try { await nf.cancelNotification(String(oldNotifId)) } catch (e) { console.warn(e) }
        newNotifId = null
      }

      if (programar) {
        // If we already have an old notification id, and date/time unchanged, keep it
        const sameDate = oldNotifId && fecha === recordatorio.fecha_aviso && hora.slice(0,5) === recordatorio.hora.slice(0,5)
        if (!sameDate) {
          const date = buildDateFromFechaHora(fecha, hora)
          if (oldNotifId) {
            // cancel old then create new (safer than in-place update)
            try { await nf.cancelNotification(String(oldNotifId)) } catch (e) { console.warn(e) }
          }
          newNotifId = await nf.scheduleTrigger({ title: recordatorio.pago?.titulo ?? mensaje ?? t('Reminder'), body: mensaje ?? undefined, date, smallIcon: 'ic_launcher' })
        }
      }

      // Update DB with new values and notification id
      const updated = await updateRecordatorio(recordatorio.id_recordatorio, { fecha_aviso: fecha, hora, mensaje: mensaje || null, notification_id: newNotifId })
      // Merge with existing local recordatorio to preserve related fields (like pago)
      const merged = { ...(recordatorio as any), ...(updated as any) }
      onUpdated?.(merged)
      onClose()
    } catch (err: any) {
      console.error('Error updating reminder', err)
      showToast(err?.message ?? t('ErrorUpdatingReminder'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!recordatorio) return
    Alert.alert(t('DeleteReminderTitle'), t('DeleteReminderConfirm'), [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Delete'), style: 'destructive', onPress: async () => {
        setSubmitting(true)
        try {
          const nid = (recordatorio as any).notification_id
          if (nid) {
            try { await nf.cancelNotification(String(nid)) } catch (e) { console.warn(e) }
          }
          await deleteRecordatorio(recordatorio.id_recordatorio)
          onDeleted?.(recordatorio.id_recordatorio)
          onClose()
        } catch (e) {
          console.error('Error deleting', e)
          showToast(t('ErrorDeletingReminder'))
        } finally { setSubmitting(false) }
      }}
    ])
  }

  if (!recordatorio) return null

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, isDark ? { backgroundColor: '#0B1220' } : {}]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, isDark ? { color: '#E5E7EB' } : {}]}>{t('EditReminder')}</Text>
          <Pressable onPress={onClose} style={styles.headerClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={isDark ? '#E5E7EB' : '#0B2E35'} />
          </Pressable>
        </View>

        <Text style={[styles.label, isDark ? { color: '#E5E7EB' } : {}]}>{t('Date')}</Text>
        <Pressable style={[styles.input, isDark ? styles.inputDark : {}]} onPress={() => setShowDatePicker(true)}>
          <Text style={isDark ? { color: '#E5E7EB' } : undefined}>{(() => {
            if (!fecha) return ''
            const [y, m, d] = fecha.split('-').map(Number)
            return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
          })()}</Text>
        </Pressable>

        <Text style={[styles.label, isDark ? { color: '#E5E7EB' } : {}]}>{t('Time')}</Text>
        <Pressable style={[styles.input, isDark ? styles.inputDark : {}]} onPress={() => setShowTimePicker(true)}>
          <Text style={isDark ? { color: '#E5E7EB' } : undefined}>{(() => {
            const [hh, mm] = hora.split(':').map((s) => Number(s))
            return new Date(1970, 0, 1, hh || 0, mm || 0).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })
          })()}</Text>
        </Pressable>

        <Text style={[styles.label, isDark ? { color: '#E5E7EB' } : {}]}>{t('Message')}</Text>
        <TextInput value={mensaje} onChangeText={setMensaje} style={[styles.input, { height: 100 }, isDark ? styles.inputDarkText : {}]} multiline />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
          <Text style={isDark ? { color: '#E5E7EB', marginRight: 8 } : { marginRight: 8 }}>{t('ScheduleNotification')}</Text>
          <Pressable onPress={() => setProgramar(!programar)} style={[styles.iconToggle, programar && styles.iconToggleActive, isDark && programar ? { backgroundColor: '#0B3B3B' } : {}]}>
            <Ionicons name={programar ? 'notifications' : 'notifications-off-outline'} size={18} color={programar ? '#fff' : (isDark ? '#E5E7EB' : '#0B2E35')} />
          </Pressable>
          <Text style={{ fontSize: 12, color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: 8, marginLeft: 2 }}>{t('ScheduleNotificationHint')}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={handleSave} style={[styles.buttonPrimary, submitting && styles.buttonDisabled, { flex: 1 }]} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? t('saving') : t('Save')}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} style={[styles.buttonDanger, submitting && styles.buttonDisabled, { marginLeft: 8 }]} disabled={submitting}>
            <Text style={styles.buttonText}>{t('Delete')}</Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(fecha)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, selected) => {
              setShowDatePicker(Platform.OS === 'ios')
              if (selected) {
                // Build ISO date from local components to avoid UTC shift
                const y = selected.getFullYear()
                const m = String(selected.getMonth() + 1).padStart(2, '0')
                const d = String(selected.getDate()).padStart(2, '0')
                const iso = `${y}-${m}-${d}`
                  setFecha(iso)
                  console.log('RecordatorioEditor: fecha seleccionada ->', { iso, fechaInput: fecha, selectedLocal: selected, tzOffsetMin: selected.getTimezoneOffset() })
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date(`1970-01-01T${hora}`)}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, selected) => {
              setShowTimePicker(Platform.OS === 'ios')
              if (selected) {
                const hh = String(selected.getHours()).padStart(2, '0')
                const mm = String(selected.getMinutes()).padStart(2, '0')
                  setHora(`${hh}:${mm}`)
                  console.log('RecordatorioEditor: hora seleccionada ->', { hh, mm, hora: `${hh}:${mm}` })
              }
            }}
          />
        )}

        {/* footer left intentionally empty; close handled in header */}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerClose: { padding: 6 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#0B2E35', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  inputDark: { backgroundColor: '#071018', borderColor: '#1F2933' },
  inputDarkText: { backgroundColor: '#071018', borderColor: '#1F2933', color: '#E5E7EB' },
  button: { backgroundColor: '#06B6D4', padding: 14, borderRadius: 10, alignItems: 'center' },
  deleteButton: { backgroundColor: '#EF4444', marginLeft: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  iconToggle: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  iconToggleActive: { backgroundColor: '#0B2E35', borderColor: '#0B2E35' },
  actionsRow: { flexDirection: 'row', marginTop: 10 },
  buttonPrimary: { backgroundColor: '#12C48B', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonDanger: { backgroundColor: '#EF4444', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  close: { marginTop: 12, alignItems: 'center' },
})
