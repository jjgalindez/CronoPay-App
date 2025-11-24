import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal, TextInput, Platform, Alert } from 'react-native'
import { useColorScheme } from 'nativewind'
import DateTimePicker from '@react-native-community/datetimepicker'
import { RecordatorioItem } from './RecordatoriosList'
import useNotifee from '../hooks/useNotifee'
import { updateRecordatorio, deleteRecordatorio } from '../../lib/api/recordatorios'

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
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(fecha)) return 'Fecha inválida'
    if (!/^[0-9]{1,2}:[0-9]{2}$/.test(hora)) return 'Hora inválida'
    return null
  }

  async function handleSave() {
    if (!recordatorio) return
    const v = validate()
    if (v) return Alert.alert('Error', v)

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
          newNotifId = await nf.scheduleTrigger({ title: recordatorio.pago?.titulo ?? mensaje ?? 'Recordatorio', body: mensaje ?? undefined, date, smallIcon: 'ic_launcher' })
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
      Alert.alert('Error', err?.message ?? 'Error actualizando recordatorio')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!recordatorio) return
    Alert.alert('Eliminar recordatorio', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
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
          Alert.alert('Error', 'No se pudo eliminar el recordatorio')
        } finally { setSubmitting(false) }
      }}
    ])
  }

  if (!recordatorio) return null

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, isDark ? { backgroundColor: '#0B1220' } : {}]}>
        <Text style={[styles.title, isDark ? { color: '#E5E7EB' } : {}]}>Editar recordatorio</Text>

        <Text style={[styles.label, isDark ? { color: '#E5E7EB' } : {}]}>Fecha</Text>
        <Pressable style={[styles.input, isDark ? { backgroundColor: '#0B1220', borderColor: '#1F2933' } : {}]} onPress={() => setShowDatePicker(true)}>
          <Text style={isDark ? { color: '#E5E7EB' } : undefined}>{(() => {
            if (!fecha) return ''
            const [y, m, d] = fecha.split('-').map(Number)
            return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
          })()}</Text>
        </Pressable>

        <Text style={[styles.label, isDark ? { color: '#E5E7EB' } : {}]}>Hora</Text>
        <Pressable style={[styles.input, isDark ? { backgroundColor: '#0B1220', borderColor: '#1F2933' } : {}]} onPress={() => setShowTimePicker(true)}>
          <Text style={isDark ? { color: '#E5E7EB' } : undefined}>{(() => {
            const [hh, mm] = hora.split(':').map((s) => Number(s))
            return new Date(1970, 0, 1, hh || 0, mm || 0).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })
          })()}</Text>
        </Pressable>

        <Text style={[styles.label, isDark ? { color: '#E5E7EB' } : {}]}>Mensaje</Text>
        <TextInput value={mensaje} onChangeText={setMensaje} style={[styles.input, { height: 100 }, isDark ? { backgroundColor: '#071018', borderColor: '#1F2933', color: '#E5E7EB' } : {}]} multiline />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
          <Text style={isDark ? { color: '#E5E7EB', marginRight: 8 } : { marginRight: 8 }}>Programar notificación</Text>
          <Pressable onPress={() => setProgramar(!programar)} style={[styles.toggle, programar && styles.toggleActive, isDark && programar ? { backgroundColor: '#0B3B3B' } : {}]}>
            <Text style={{ color: programar ? '#fff' : isDark ? '#E5E7EB' : '#0B2E35' }}>{programar ? 'ON' : 'OFF'}</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={handleSave} style={[styles.button, { flex: 1 }]} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? 'Guardando...' : 'Guardar'}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} style={[styles.button, styles.deleteButton]} disabled={submitting}>
            <Text style={styles.buttonText}>Eliminar</Text>
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

        <Pressable onPress={onClose} style={styles.close}><Text style={{ color: isDark ? '#E5E7EB' : '#0B2E35' }}>Cerrar</Text></Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '700', color: '#0B2E35', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  button: { backgroundColor: '#06B6D4', padding: 14, borderRadius: 10, alignItems: 'center' },
  deleteButton: { backgroundColor: '#EF4444', marginLeft: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
  toggle: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  toggleActive: { backgroundColor: '#0B2E35' },
  close: { marginTop: 12, alignItems: 'center' },
})
