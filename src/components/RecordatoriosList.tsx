import React, { useMemo, useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { Switch, ActivityIndicator } from "react-native"

import RecordatorioEditor from "./RecordatorioEditor"
import { updateRecordatorio } from "../../lib/api/recordatorios"
import useNotifee, { supportsTrigger } from "../hooks/useNotifee"
import { isOverdue, getDaysUntil } from "../utils/dateHelpers"

import { useTema } from "@/hooks/useTema"

export type RecordatorioItem = {
  id_recordatorio: number
  fecha_aviso: string // ISO date
  hora: string // HH:MM:SS or HH:MM (NOT NULL)
  mensaje?: string | null
  id_pago: number
  // optional related pago fields
  pago?: {
    titulo?: string
    monto?: string | number
    estado?: string
    metodo?: string
  }
}

type FilterKey = "Todos" | "Pendientes" | "Vencidos" | "Pagado"

type RecordatoriosListProps = {
  items?: RecordatorioItem[]
  style?: StyleProp<ViewStyle>
  showFilters?: boolean
  initialFilter?: FilterKey
  onItemPress?: (item: RecordatorioItem) => void
}

const FILTERS: FilterKey[] = ["Todos", "Pendientes", "Vencidos", "Pagado"]

function formatDateLabel(dateStr: string, timeStr?: string | null) {
  try {
    let d: Date
    if (timeStr) {
      // build ISO datetime: date + 'T' + time
      d = new Date(`${dateStr}T${timeStr}`)
    } else {
      d = new Date(dateStr)
    }

    const datePart = d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    if (timeStr) {
      const timePart = d.toLocaleTimeString("es-ES", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      return `${datePart} a las ${timePart}`
    }

    return datePart
  } catch (e) {
    return dateStr
  }
}

function formatTime(timeStr: string) {
  // Expect formats like HH:MM or HH:MM:SS
  if (!timeStr) return ""
  try {
    // create a Date on epoch day so toLocaleTimeString can format with AM/PM
    const d = new Date(`1970-01-01T${timeStr}`)
    return d.toLocaleTimeString("es-ES", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch (e) {
    // fallback to basic HH:MM
    const parts = timeStr.split(":")
    if (parts.length >= 2)
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`
    return timeStr
  }
}

export default function RecordatoriosList({
  items = [],
  style,
  showFilters = true,
  initialFilter = "Todos",
  onItemPress,
}: RecordatoriosListProps) {
  const { tema } = useTema()
  const isDark = tema === "dark"

  // dark fallback colors
  const DARK_CARD_BG = "#0B0F13"
  const DARK_MUTED = "#9CA3AF"
  const DARK_SURFACE = "#111827"
  const DARK_FILTER_ACTIVE = "#0B3B3B"
  const DARK_TEXT = "#E5E7EB"
  const [filter, setFilter] = useState<FilterKey>(initialFilter)
  const [schedulingMap, setSchedulingMap] = useState<Record<number, boolean>>(
    {},
  )
  const [notificationIdMap, setNotificationIdMap] = useState<
    Record<number, string | null>
  >({})
  const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({})
  const [selected, setSelected] = useState<RecordatorioItem | null>(null)
  const [editorVisible, setEditorVisible] = useState(false)
  const [schedulingSupported, setSchedulingSupported] = useState<
    boolean | null
  >(null)
  const nf = useNotifee()
  const [localItems, setLocalItems] = useState<RecordatorioItem[]>(items)

  // keep a local copy of items so UI can refresh immediately after edits
  useEffect(() => setLocalItems(items), [items])

  useEffect(() => {
    // initialize scheduling map from localItems' notification_id
    const map: Record<number, boolean> = {}
    const nmap: Record<number, string | null> = {}
    localItems.forEach((it) => {
      const nid = (it as any).notification_id ?? null
      map[it.id_recordatorio] = Boolean(nid)
      nmap[it.id_recordatorio] = nid
    })
    setSchedulingMap(map)
    setNotificationIdMap(nmap)
  }, [localItems])

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const ok = await supportsTrigger()
          if (mounted) setSchedulingSupported(ok)
        } catch (e) {
          if (mounted) setSchedulingSupported(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    if (!localItems || localItems.length === 0) return []

    const today = new Date()

    return localItems.filter((it) => {
      const datetime = `${it.fecha_aviso}T${it.hora}`
      const overdue = isOverdue(datetime)
      const pagoEstado = it.pago?.estado ?? ""

      if (filter === "Todos") return true
      if (filter === "Vencidos") return overdue && pagoEstado !== "Pagado"
      if (filter === "Pendientes") return !overdue && pagoEstado !== "Pagado"
      if (filter === "Pagado") return pagoEstado === "Pagado"
      return true
    })
  }, [localItems, filter])

  // Estilos dinámicos basados en tema
  const dynamicStyles = {
    container: [styles.container, style],
    warningBox: [styles.warningBox, isDark && styles.warningBoxDark],
    warningText: [styles.warningText, isDark && styles.warningTextDark],
    filterBtn: (active: boolean) => [
      styles.filterBtn,
      active && styles.filterBtnActive,
      active && isDark && styles.filterBtnActiveDark,
      !active && isDark && styles.filterBtnInactiveDark,
    ],
    filterText: (active: boolean) => [
      styles.filterText,
      active && styles.filterTextActive,
      !active && isDark && styles.filterTextDark,
      active && isDark && styles.filterTextActiveDark,
    ],
    emptyText: [styles.empty, isDark && styles.emptyDark],
    card: [styles.card, isDark && styles.cardDark],
    statusLabel: (status: string) => [
      styles.statusLabel,
      isDark && styles.statusLabelDark,
    ],
    timeText: [styles.timeText, isDark && styles.timeTextDark],
    title: [styles.title, isDark && styles.titleDark],
    message: [styles.message, isDark && styles.messageDark],
    dateLabel: [styles.dateLabel, isDark && styles.dateLabelDark],
    amount: [styles.amount, isDark && styles.amountDark],
  }

  return (
    <View style={dynamicStyles.container}>
      {schedulingSupported === false ? (
        <View style={dynamicStyles.warningBox}>
          <Text style={dynamicStyles.warningText}>
            La programación de recordatorios está limitada en este entorno (no
            hay soporte de triggers). Algunas funciones pueden no estar
            disponibles.
          </Text>
        </View>
      ) : null}
      {showFilters && (
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={({ pressed }) => [
                ...dynamicStyles.filterBtn(filter === f),
                pressed && styles.filterPressed,
              ]}
            >
              <Text style={dynamicStyles.filterText(filter === f)}>{f}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView nestedScrollEnabled style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={dynamicStyles.emptyText}>
            No hay recordatorios para este filtro.
          </Text>
        ) : (
          filtered.map((it) => {
            const datetime = `${it.fecha_aviso}T${it.hora}`
            const overdue = isOverdue(datetime)
            const days = getDaysUntil(datetime)
            const status =
              it.pago?.estado === "Pagado"
                ? "Pagado"
                : overdue
                  ? "Vencido"
                  : days === 0
                    ? "Hoy"
                    : "Próximo"

            const scheduled = schedulingMap[it.id_recordatorio] ?? false

            return (
              <Pressable
                key={it.id_recordatorio}
                onPress={() => {
                  setSelected(it)
                  setEditorVisible(true)
                  onItemPress?.(it)
                }}
                style={dynamicStyles.card}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.statusDot,
                      status === "Vencido"
                        ? styles.dotRed
                        : status === "Pagado"
                          ? styles.dotGreen
                          : styles.dotYellow,
                    ]}
                  />
                  <Text style={dynamicStyles.statusLabel(status)}>
                    {status}
                  </Text>
                  <Text style={dynamicStyles.timeText}>
                    {formatTime(it.hora)}
                  </Text>
                  <View style={{ marginLeft: 12 }}>
                    {loadingMap[it.id_recordatorio] ? (
                      <ActivityIndicator size="small" />
                    ) : (
                      <Switch
                        value={scheduled}
                        onValueChange={async (value) => {
                          // toggle schedule

                          setLoadingMap((m) => ({
                            ...m,
                            [it.id_recordatorio]: true,
                          }))
                          try {
                            if (value) {
                              // schedule notification
                              const currentNotifId =
                                notificationIdMap[it.id_recordatorio] ??
                                (it as any).notification_id
                              const date = new Date(
                                `${it.fecha_aviso}T${it.hora}`,
                              )
                              const notifId = await nf.scheduleTrigger({
                                title:
                                  it.pago?.titulo ??
                                  it.mensaje ??
                                  "Recordatorio",
                                body: it.mensaje ?? undefined,
                                date,
                                smallIcon: "ic_launcher",
                              })
                              // persist to DB
                              await updateRecordatorio(it.id_recordatorio, {
                                notification_id: notifId,
                              })
                              // update local maps so cancel uses the known id
                              setSchedulingMap((m) => ({
                                ...m,
                                [it.id_recordatorio]: true,
                              }))
                              setNotificationIdMap((m) => ({
                                ...m,
                                [it.id_recordatorio]: String(notifId),
                              }))
                              // update localItems so UI reloads immediately
                              setLocalItems((prev) =>
                                prev.map((p) =>
                                  p.id_recordatorio === it.id_recordatorio
                                    ? { ...p, notification_id: notifId }
                                    : p,
                                ),
                              )
                            } else {
                              // cancel: obtain notification id from item
                              // prefer the in-memory map (reflects latest scheduled id)
                              const notifId =
                                notificationIdMap[it.id_recordatorio] ??
                                (it as any).notification_id
                              if (notifId) {
                                await nf.cancelNotification(String(notifId))
                                await updateRecordatorio(it.id_recordatorio, {
                                  notification_id: null,
                                })
                                // clear local map
                                setNotificationIdMap((m) => ({
                                  ...m,
                                  [it.id_recordatorio]: null,
                                }))
                                // update localItems so UI reloads immediately
                                setLocalItems((prev) =>
                                  prev.map((p) =>
                                    p.id_recordatorio === it.id_recordatorio
                                      ? { ...p, notification_id: null }
                                      : p,
                                  ),
                                )
                              }
                              setSchedulingMap((m) => ({
                                ...m,
                                [it.id_recordatorio]: false,
                              }))
                            }
                          } catch (err: any) {
                            console.error(
                              "Error scheduling/canceling notification",
                              err,
                            )
                            // Special handling when Android exact-alarm permission is required
                            if (
                              err &&
                              (err.code === "ALARM_PERMISSION_REQUIRED" ||
                                String(err.message).includes(
                                  "ALARM_PERMISSION_REQUIRED",
                                ))
                            ) {
                              Alert.alert(
                                "Permiso requerido",
                                'Android requiere el permiso de "alarma exacta" para programar recordatorios en segundo plano. ¿Quieres abrir la configuración de permisos para habilitarlo?',
                                [
                                  { text: "Cancelar", style: "cancel" },
                                  {
                                    text: "Abrir ajustes",
                                    onPress: async () => {
                                      try {
                                        await nf.openAlarmPermissionSettings()
                                      } catch (e) {
                                        console.warn(e)
                                      }
                                    },
                                  },
                                ],
                              )
                            }
                          } finally {
                            setLoadingMap((m) => ({
                              ...m,
                              [it.id_recordatorio]: false,
                            }))
                          }
                        }}
                      />
                    )}
                  </View>
                </View>

                <Text style={dynamicStyles.title}>
                  {it.pago?.titulo ?? it.mensaje ?? "Recordatorio"}
                </Text>
                {it.mensaje ? (
                  <Text style={dynamicStyles.message}>{it.mensaje}</Text>
                ) : null}

                <View style={styles.row}>
                  <Text style={dynamicStyles.dateLabel}>
                    {status === "Pagado"
                      ? `Pagado el ${formatDateLabel(it.fecha_aviso, it.hora)}`
                      : `Vence el ${formatDateLabel(it.fecha_aviso, it.hora)}`}
                  </Text>
                  {it.pago?.monto ? (
                    <Text style={dynamicStyles.amount}>
                      ${Number(it.pago.monto).toLocaleString("es-CL")}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            )
          })
        )}
      </ScrollView>
      <RecordatorioEditor
        visible={editorVisible}
        recordatorio={selected}
        onClose={() => {
          setEditorVisible(false)
          setSelected(null)
        }}
        onUpdated={(updated) => {
          // optimistic local update: update maps
          setNotificationIdMap((m) => ({
            ...m,
            [updated.id_recordatorio]: (updated as any).notification_id ?? null,
          }))
          setSchedulingMap((m) => ({
            ...m,
            [updated.id_recordatorio]: Boolean(
              (updated as any).notification_id,
            ),
          }))
          setLocalItems((prev) =>
            prev.map((p) =>
              p.id_recordatorio === updated.id_recordatorio
                ? (updated as any)
                : p,
            ),
          )
        }}
        onDeleted={(id) => {
          // remove local maps
          setNotificationIdMap((m) => {
            const copy = { ...m }
            delete copy[id]
            return copy
          })
          setSchedulingMap((m) => {
            const copy = { ...m }
            delete copy[id]
            return copy
          })
          setLocalItems((prev) => prev.filter((p) => p.id_recordatorio !== id))
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  warningBox: {
    backgroundColor: "#FFF4E5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  warningBoxDark: {
    backgroundColor: "#422006",
  },
  warningText: {
    color: "#92400E",
  },
  warningTextDark: {
    color: "#FDE68A",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterBtnActive: {
    backgroundColor: "#0B3B3B",
  },
  filterBtnActiveDark: {
    backgroundColor: "#fafafa",
  },
  filterBtnInactiveDark: {
    backgroundColor: "#262626",
  },
  filterPressed: {
    opacity: 0.85,
  },
  filterText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterTextActiveDark: {
    color: "#0B3B3B",
  },
  filterTextDark: {
    color: "#a3a3a3",
  },
  list: {
    maxHeight: 500,
  },
  empty: {
    color: "#6B7280",
    padding: 20,
    textAlign: "center",
  },
  emptyDark: {
    color: "#a3a3a3",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "#171717",
    shadowColor: "#000",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  dotRed: { backgroundColor: "#FF6B6B" },
  dotYellow: { backgroundColor: "#FFB020" },
  dotGreen: { backgroundColor: "#12C48B" },
  statusLabel: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "700",
  },
  statusLabelDark: {
    color: "#FCA5A5",
  },
  title: {
    fontSize: 15,
    color: "#0B2E35",
    fontWeight: "700",
    marginBottom: 6,
  },
  titleDark: {
    color: "#fafafa",
  },
  message: {
    color: "#6B7280",
    marginBottom: 8,
  },
  messageDark: {
    color: "#a3a3a3",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateLabel: {
    color: "#6B7280",
    fontSize: 13,
  },
  dateLabelDark: {
    color: "#a3a3a3",
  },
  timeText: {
    marginLeft: "auto",
    fontSize: 16,
    fontWeight: "800",
    color: "#0B2E35",
  },
  timeTextDark: {
    color: "#fafafa",
  },
  amount: {
    fontWeight: "700",
    color: "#0B2E35",
    fontSize: 14,
  },
  amountDark: {
    color: "#fafafa",
  },
})
