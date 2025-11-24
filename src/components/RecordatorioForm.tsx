import React, { useMemo, useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, Modal, FlatList, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useAuth } from '../../providers/AuthProvider'
import { usePagos } from '../hooks/usePagos'
import useRecordatorios from '../hooks/useRecordatorios'
import { router } from 'expo-router'
import useNotifee from '../hooks/useNotifee'
import { updateRecordatorio } from '../../lib/api/recordatorios'

type Props = {
  onSaved?: () => void
}

export default function RecordatorioForm({ onSaved }: Props) {
  const { session } = useAuth()
  const userId = session?.user?.id ?? null
  const { data: pagos = [] } = usePagos(userId, { enabled: !!userId })
  const { create } = useRecordatorios()
  const nf = useNotifee()

  const [selectedPagoId, setSelectedPagoId] = useState<number | null>(pagos[0]?.id_pago ?? null)
  const [fecha, setFecha] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [hora, setHora] = useState<string>(() => new Date().toTimeString().slice(0,5))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [mensaje, setMensaje] = useState<string>('')
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // keep selectedPagoId in sync when pagos load
  React.useEffect(() => {
    if (!selectedPagoId && pagos.length > 0) setSelectedPagoId(pagos[0].id_pago)
  }, [pagos])

  const selectedPagoTitle = useMemo(() => pagos.find(p => p.id_pago === selectedPagoId)?.titulo ?? null, [pagos, selectedPagoId])

  function validate() {
    if (!selectedPagoId) return 'Selecciona un pago'
    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(fecha)) return 'Fecha inválida'
    if (!/^[0-9]{1,2}:[0-9]{2}$/.test(hora)) return 'Hora inválida'
    return null
  }

  async function handleSubmit() {
    setError(null)
    const v = validate()
    if (v) {
      setError(v)
      return
    }

    try {
      setSubmitting(true)
      const created = await create({ fecha_aviso: fecha, hora, mensaje: mensaje || null, id_pago: Number(selectedPagoId) })
      // created may be the new record or nothing; try to extract id
      const recId = (created as any)?.id_recordatorio ?? (created as any)?.id ?? null
      if (recId) {
        function buildDateFromFechaHora(fechaStr: string, horaStr: string) {
          const [y, m, d] = fechaStr.split('-').map(Number)
          const [hh, mm] = horaStr.split(':').map((s) => Number(s))
          return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0)
        }
        const date = buildDateFromFechaHora(fecha, hora)
        try {
          const nid = await nf.scheduleTrigger({ title: selectedPagoTitle ?? 'Recordatorio', body: mensaje || undefined, date, smallIcon: 'ic_launcher' })
          if (nid) {
            await updateRecordatorio(recId, { notification_id: nid })
          }
        } catch (e) {
          console.warn('No se pudo programar trigger tras crear recordatorio', e)
        }
      }
      onSaved?.()
      router.back()
    } catch (err: any) {
      console.error('Error creando recordatorio', err)
      setError(err?.message ?? 'Error creando recordatorio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pago</Text>
      <Pressable style={styles.select} onPress={() => setShowPagoModal(true)}>
        <Text style={styles.selectText}>{selectedPagoTitle ?? 'Selecciona un pago'}</Text>
      </Pressable>

      <Text style={styles.label}>Fecha</Text>
      <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text>{(() => {
          if (!fecha) return ''
          const [y, m, d] = fecha.split('-').map(Number)
          return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
        })()}</Text>
      </Pressable>

      <Text style={styles.label}>Hora</Text>
      <Pressable style={styles.input} onPress={() => setShowTimePicker(true)}>
        <Text>{new Date(`1970-01-01T${hora}`).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })}</Text>
      </Pressable>

      <Text style={styles.label}>Mensaje (opcional)</Text>
      <TextInput value={mensaje} onChangeText={setMensaje} style={[styles.input, { height: 100 }]} placeholder="Recordar pagar suscripción" multiline />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={handleSubmit} style={[styles.button, submitting && styles.buttonDisabled]} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Guardando...' : 'Guardar recordatorio'}</Text>
      </Pressable>

      <Modal visible={showPagoModal} animationType="slide" onRequestClose={() => setShowPagoModal(false)}>
        <View style={styles.modalWrap}>
          <Text style={styles.modalTitle}>Selecciona un pago</Text>
          <FlatList data={pagos} keyExtractor={(p: any) => String(p.id_pago)} renderItem={({ item }: any) => (
            <Pressable style={styles.pagoRow} onPress={() => { setSelectedPagoId(item.id_pago); setShowPagoModal(false) }}>
              <Text style={styles.pagoTitle}>{item.titulo}</Text>
              <Text style={styles.pagoSub}>{item.monto ? `$${Number(item.monto).toLocaleString('es-CL')}` : ''}</Text>
            </Pressable>
          )} />

          <Pressable onPress={() => setShowPagoModal(false)} style={styles.modalClose}><Text style={styles.modalCloseText}>Cerrar</Text></Pressable>
        </View>
      </Modal>

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
              console.log('RecordatorioForm: fecha seleccionada ->', { iso, selectedLocal: selected, tzOffsetMin: selected.getTimezoneOffset() })
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
              console.log('RecordatorioForm: hora seleccionada ->', { hh, mm, hora: `${hh}:${mm}` })
            }
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#0B2E35', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  select: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  selectText: { color: '#0B2E35' },
  button: { backgroundColor: '#06B6D4', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#EF4444', marginBottom: 8 },
  modalWrap: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  pagoRow: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  pagoTitle: { fontWeight: '700', color: '#0B2E35' },
  pagoSub: { color: '#6B7280' },
  modalClose: { marginTop: 12, alignItems: 'center' },
  modalCloseText: { color: '#0B2E35', fontWeight: '700' },
})
