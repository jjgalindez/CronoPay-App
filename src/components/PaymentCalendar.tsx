import { PagoWithRelations } from "lib/api/pagos"
import { useAuth } from "providers/AuthProvider"
import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from '@expo/vector-icons'

import { usePagos } from "../hooks/usePagos"
import { useTema } from "@/hooks/useTema"
import {
  getMonthName,
  filterByMonth,
  isToday,
  isOverdue,
  getDaysUntil,
  getMonthRange,
  getPreviousMonth,
  getNextMonth
} from "../utils/dateHelpers"

export function PaymentCalendar() {
  const { tema } = useTema()
  const isDark = tema === "dark"
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Obtener usuario del contexto de autenticación
  const { session } = useAuth()
  const userId = session?.user?.id ?? null

  // Obtener pagos del usuario
  const { data: pagos, isLoading, error } = usePagos(userId)

  // Navegación entre meses
  const goToPreviousMonth = () => {
    const { month, year } = getPreviousMonth(currentMonth, currentYear)
    setCurrentMonth(month)
    setCurrentYear(year)
    setSelectedDay(null) // Limpiar selección al cambiar de mes
  }

  const goToNextMonth = () => {
    const { month, year } = getNextMonth(currentMonth, currentYear)
    setCurrentMonth(month)
    setCurrentYear(year)
    setSelectedDay(null) // Limpiar selección al cambiar de mes
  }

  const goToCurrentMonth = () => {
    const today = new Date()
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDay(null)
  }

  // Verificar si estamos en el mes actual
  const isCurrentMonth = useMemo(() => {
    const today = new Date()
    return currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }, [currentMonth, currentYear])

  // Obtener el primer día del mes y cuántos días tiene
  const { daysInMonth, startDayOfWeek } = useMemo(() => {
    const first = new Date(currentYear, currentMonth, 1)
    const last = new Date(currentYear, currentMonth + 1, 0)
    return {
      daysInMonth: last.getDate(),
      startDayOfWeek: first.getDay(),
    }
  }, [currentYear, currentMonth])

  // Nombres de los días
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

// Procesar pagos del mes actual - VERSIÓN MANUAL COMPLETA
const paymentsThisMonth = useMemo(() => {
  if (!pagos || isLoading) return []
  
  const filtered = pagos.filter((pago) => {
    try {
      // Parsear manualmente la fecha YYYY-MM-DD
      const [yearStr, monthStr, dayStr] = pago.fecha_vencimiento.split('-')
      const pagoYear = parseInt(yearStr)
      const pagoMonth = parseInt(monthStr) - 1 // Restar 1 porque los meses en JS son 0-based
      
      console.log(`DEBUG: ${pago.titulo} - Fecha: ${pago.fecha_vencimiento} -> Mes: ${pagoMonth}, Año: ${pagoYear}`)
      console.log(`DEBUG: Comparando con -> Mes actual: ${currentMonth}, Año actual: ${currentYear}`)
      console.log(`DEBUG: Coincide: ${pagoMonth === currentMonth && pagoYear === currentYear}`)
      
      return pagoMonth === currentMonth && pagoYear === currentYear
    } catch (error) {
      console.error('Error procesando fecha:', pago.fecha_vencimiento, error)
      return false
    }
  })
  
  console.log('=== DEBUG MANUAL FILTER ===')
  console.log('Buscando mes:', currentMonth, '(0-based), año:', currentYear)
  console.log('Total pagos disponibles:', pagos.length)
  console.log('Pagos encontrados para este mes:', filtered.length)
  
  if (filtered.length === 0) {
    console.log('NO se encontraron pagos para este mes')
    // Mostrar todos los pagos disponibles para debug
    pagos.forEach(p => {
      const [y, m, d] = p.fecha_vencimiento.split('-')
      console.log(`Pago disponible: ${p.titulo} - ${p.fecha_vencimiento} -> Mes: ${parseInt(m)-1}, Año: ${y}`)
    })
  } else {
    filtered.forEach(p => {
      console.log(`- ${p.titulo}: ${p.fecha_vencimiento}`)
    })
  }
  console.log('=== FIN DEBUG ===')
  
  return filtered
}, [pagos, isLoading, currentMonth, currentYear])

// Obtener días con pagos - VERSIÓN ROBUSTA (ESTA ES LA QUE FALTABA)
const paymentDaysByDate = useMemo(() => {
  const result: Record<number, PagoWithRelations[]> = {}

  paymentsThisMonth.forEach((pago) => {
    // Parsear la fecha manualmente del formato YYYY-MM-DD
    const dateParts = pago.fecha_vencimiento.split('-')
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[2])

      if (!result[day]) {
        result[day] = []
      }
      result[day].push(pago)
    }
  })

  console.log('Calendario - Días con pagos:', Object.keys(result).length)
  Object.entries(result).forEach(([day, pagos]) => {
    console.log(`Calendario - Día ${day}: ${pagos.length} pagos`)
    pagos.forEach(pago => {
      const dayFromString = parseInt(pago.fecha_vencimiento.split('-')[2])
      console.log(`  - ${pago.titulo}: ${pago.fecha_vencimiento} -> Día del string: ${dayFromString}`)
    })
  })

  return result
}, [paymentsThisMonth])

  // Obtener pagos del día seleccionado
  const selectedDayPayments = useMemo(() => {
    if (selectedDay === null) return []
    return paymentDaysByDate[selectedDay] || []
  }, [selectedDay, paymentDaysByDate])

  // Función para verificar si un día específico es hoy
  const isDayToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Generar array de días del calendario
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = []

    // Días vacíos del mes anterior
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [startDayOfWeek, daysInMonth])

  // Estilos dinámicos basados en tema
  const dynamicStyles = {
    container: [styles.container, isDark && styles.containerDark],
    card: [styles.card, isDark && styles.cardDark],
    title: [styles.title, isDark && styles.titleDark],
    subtitle: [styles.subtitle, isDark && styles.subtitleDark],
    monthText: [styles.monthText, isDark && styles.monthTextDark],
    weekDayText: [styles.weekDayText, isDark && styles.weekDayTextDark],
    dayText: [styles.dayText, isDark && styles.dayTextDark],
    legendText: [styles.legendText, isDark && styles.legendTextDark],
    summaryTitle: [styles.summaryTitle, isDark && styles.summaryTitleDark],
    summaryLabel: [styles.summaryLabel, isDark && styles.summaryLabelDark],
    summaryValue: [styles.summaryValue, isDark && styles.summaryValueDark],
    loadingText: [styles.loadingText, isDark && styles.loadingTextDark],
    paymentDetailText: [styles.paymentDetailText, isDark && styles.paymentDetailTextDark],
    paymentTitle: [styles.paymentTitle, isDark && styles.paymentTitleDark],
    paymentAmount: [styles.paymentAmount, isDark && styles.paymentAmountDark],
    navButton: [styles.navButton, isDark && styles.navButtonDark],
    navButtonText: [styles.navButtonText, isDark && styles.navButtonTextDark],
  }

  // Si no hay sesión
  if (!session && !isLoading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>🔒</Text>
            <Text style={styles.errorText}>No autenticado</Text>
            <Text style={styles.errorSubtext}>
              Debes iniciar sesión para ver tus pagos
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // Manejo de errores
  if (error) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>Error al cargar los pagos</Text>
            <Text style={styles.errorSubtext}>{error.message}</Text>
          </View>
        </View>
      </View>
    )
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Función para renderizar cada día
  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />
    }

    const dayPayments = paymentDaysByDate[day] || []
    const hasPayments = dayPayments.length > 0
    const isSelected = selectedDay === day
    const dayIsToday = isDayToday(day)

    // Contar pagos por estado
    const pendingPayments = dayPayments.filter((p) => p.estado === "Pendiente")
    const paidPayments = dayPayments.filter((p) => p.estado === "Pagado")

    // Determinar si hay pagos vencidos - USANDO dateHelpers
    const hasOverduePayments = dayPayments.some(pago =>
      pago.estado === "Pendiente" && isOverdue(pago.fecha_vencimiento)
    )

    let dayStyle: any = [styles.dayCell]
    let textStyle: any = dynamicStyles.dayText

    if (isSelected) {
      dayStyle.push(styles.daySelected)
      textStyle = [styles.dayText, styles.daySelectedText]
    } else if (dayIsToday) {
      dayStyle.push(styles.dayToday)
      textStyle = [styles.dayText, styles.dayTodayText]
    } else if (hasPayments) {
      if (hasOverduePayments) {
        dayStyle.push(styles.dayOverdue)
        textStyle = [styles.dayText, styles.dayOverdueText]
      } else if (pendingPayments.length > 0) {
        dayStyle.push(styles.dayPending)
        if (isDark) dayStyle.push(styles.dayPendingDark)
        textStyle = [styles.dayText, styles.dayPendingText]
        if (isDark) textStyle = [styles.dayText, styles.dayPendingTextDark]
      } else {
        dayStyle.push(styles.dayPaid)
        if (isDark) dayStyle.push(styles.dayPaidDark)
        textStyle = [styles.dayText, styles.dayPaidText]
        if (isDark) textStyle = [styles.dayText, styles.dayPaidTextDark]
      }
    }

    return (
      <TouchableOpacity
        key={`day-${index}`}
        style={dayStyle}
        onPress={() => {
          if (hasPayments) {
            setSelectedDay(selectedDay === day ? null : day)
          }
        }}
      >
        <Text style={textStyle}>{day}</Text>

        {hasPayments && (
          <View style={styles.indicatorContainer}>
            {pendingPayments.length > 0 && (
              <View style={[styles.indicator, styles.indicatorPending]} />
            )}
            {paidPayments.length > 0 && (
              <View style={[styles.indicator, styles.indicatorPaid]} />
            )}
          </View>
        )}
      </TouchableOpacity>
    )
  }

  // Renderizar detalles de pagos del día seleccionado
  const renderPaymentDetails = () => {
    if (selectedDay === null || selectedDayPayments.length === 0) {
      return null
    }

    const totalDia = selectedDayPayments.reduce((sum, pago) => sum + Number(pago.monto || 0), 0)

    return (
      <View style={[styles.paymentDetails, isDark && styles.paymentDetailsDark]}>
        <Text style={dynamicStyles.paymentTitle}>
          Pagos del {selectedDay} de {getMonthName(currentMonth)}
        </Text>

        <View style={styles.paymentsList}>
          {selectedDayPayments.map((pago, index) => (
            <View
              key={`${pago.id_pago}-${index}`}
              style={[styles.paymentItem, isDark && styles.paymentItemDark]}
            >
              <View style={styles.paymentInfo}>
                <Text style={dynamicStyles.paymentDetailText}>
                  {pago.titulo}
                </Text>
                <Text style={styles.paymentCategory}>
                  {pago.categoria?.nombre || "Sin categoría"} •
                  <Text style={pago.estado === "Pagado" ? styles.statusPaid : styles.statusPending}>
                    {pago.estado === "Pagado" ? " Pagado" : " Pendiente"}
                  </Text>
                </Text>
              </View>
              <Text style={dynamicStyles.paymentAmount}>
                {formatCurrency(Number(pago.monto || 0))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.paymentTotal}>
          <Text style={dynamicStyles.paymentDetailText}>Total del día:</Text>
          <Text style={dynamicStyles.paymentAmount}>
            {formatCurrency(totalDia)}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>Calendario de Pagos</Text>
          {paymentsThisMonth.length > 0 && (
            <Text style={dynamicStyles.subtitle}>
              {paymentsThisMonth.length} pago(s) en {getMonthName(currentMonth)}
            </Text>
          )}
        </View>

        {/* Navegación entre meses */}
        <View style={styles.navigation}>
          <TouchableOpacity 
            style={dynamicStyles.navButton}
            onPress={goToPreviousMonth}
          >
            <Ionicons name="chevron-back" size={20} color={isDark ? "#fafafa" : "#0a0a0a"} />
            <Text style={dynamicStyles.navButtonText}>Anterior</Text>
          </TouchableOpacity>

          <View style={styles.monthHeader}>
            <Text style={dynamicStyles.monthText}>
              {getMonthName(currentMonth)} {currentYear}
            </Text>
            {!isCurrentMonth && (
              <TouchableOpacity 
                style={styles.currentMonthButton}
                onPress={goToCurrentMonth}
              >
                <Text style={styles.currentMonthButtonText}>Hoy</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity 
            style={dynamicStyles.navButton}
            onPress={goToNextMonth}
          >
            <Text style={dynamicStyles.navButtonText}>Siguiente</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#fafafa" : "#0a0a0a"} />
          </TouchableOpacity>
        </View>

        {/* Días de la semana */}
        <View style={styles.weekDaysContainer}>
          {dayNames.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={dynamicStyles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Días del mes */}
        <View style={styles.daysContainer}>
          {calendarDays.map((day, index) => renderDay(day, index))}
        </View>

        {/* Detalles de pagos del día seleccionado */}
        {renderPaymentDetails()}

        {/* Leyenda */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendToday]} />
            <Text style={dynamicStyles.legendText}>Hoy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendSelected]} />
            <Text style={dynamicStyles.legendText}>Seleccionado</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                styles.legendPending,
                isDark && styles.legendPendingDark,
              ]}
            />
            <Text style={dynamicStyles.legendText}>Pendientes</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendOverdue]} />
            <Text style={dynamicStyles.legendText}>Vencidos</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                styles.legendPaid,
                isDark && styles.legendPaidDark,
              ]}
            />
            <Text style={dynamicStyles.legendText}>Completados</Text>
          </View>
        </View>

        {/* Resumen del mes */}
        {paymentsThisMonth.length > 0 && (
          <View style={[styles.summary, isDark && styles.summaryDark]}>
            <Text style={dynamicStyles.summaryTitle}>Resumen de {getMonthName(currentMonth)}:</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text
                  style={[
                    styles.summaryValuePending,
                    isDark && styles.summaryValuePendingDark,
                  ]}
                >
                  {
                    paymentsThisMonth.filter((p) => p.estado === "Pendiente")
                      .length
                  }
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Pendientes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text
                  style={[
                    styles.summaryValuePaid,
                    isDark && styles.summaryValuePaidDark,
                  ]}
                >
                  {
                    paymentsThisMonth.filter((p) => p.estado === "Pagado")
                      .length
                  }
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Pagados</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={dynamicStyles.summaryValue}>
                  {formatCurrency(
                    paymentsThisMonth.reduce((sum, p) => sum + Number(p.monto ?? 0), 0)
                  )}
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Total</Text>
              </View>
            </View>
          </View>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={dynamicStyles.loadingText}>Cargando pagos...</Text>
          </View>
        )}

        {!isLoading && paymentsThisMonth.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No hay pagos en {getMonthName(currentMonth)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerDark: {
    backgroundColor: "#0a0a0a",
  },

  // Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  cardDark: {
    backgroundColor: "#171717",
    borderColor: "#262626",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  titleDark: {
    color: "#fafafa",
  },
  subtitle: {
    fontSize: 12,
    color: "#737373",
  },
  subtitleDark: {
    color: "#a3a3a3",
  },

  // Navegación
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#f8fafc",
  },
  navButtonDark: {
    backgroundColor: "#262626",
    borderColor: "#404040",
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0a0a0a",
    marginHorizontal: 4,
  },
  navButtonTextDark: {
    color: "#fafafa",
  },
  monthHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  currentMonthButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#3b82f6",
    borderRadius: 6,
  },
  currentMonthButtonText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },

  // Month Header
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
  },
  monthTextDark: {
    color: "#fafafa",
  },

  // Week Days
  weekDaysContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#737373",
  },
  weekDayTextDark: {
    color: "#a3a3a3",
  },

  // Days Grid
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderRadius: 8,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayText: {
    fontSize: 14,
    color: "#0a0a0a",
  },
  dayTextDark: {
    color: "#fafafa",
  },

  // Day States - Selected
  daySelected: {
    backgroundColor: "#506266",
    borderColor: "#10454F",
  },
  daySelectedText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  // Day States - Today
  dayToday: {
    backgroundColor: "#3b82f6",
  },
  dayTodayText: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  // Day States - Pending
  dayPending: {
    backgroundColor: "#fed7aa",
  },
  dayPendingDark: {
    backgroundColor: "rgba(234, 88, 12, 0.2)",
  },
  dayPendingText: {
    color: "#c2410c",
    fontWeight: "600",
  },
  dayPendingTextDark: {
    color: "#fb923c",
  },

  // Day States - Overdue
  dayOverdue: {
    backgroundColor: "#ef4444",
  },
  dayOverdueText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Day States - Paid
  dayPaid: {
    backgroundColor: "#bbf7d0",
  },
  dayPaidDark: {
    backgroundColor: "rgba(22, 163, 74, 0.2)",
  },
  dayPaidText: {
    color: "#15803d",
    fontWeight: "600",
  },
  dayPaidTextDark: {
    color: "#4ade80",
  },

  // Indicators
  indicatorContainer: {
    flexDirection: "row",
    marginTop: 2,
    gap: 2,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  indicatorPending: {
    backgroundColor: "#c2410c",
  },
  indicatorPaid: {
    backgroundColor: "#15803d",
    opacity: 0.5,
  },

  // Payment Details
  paymentDetails: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  paymentDetailsDark: {
    backgroundColor: "#262626",
    borderColor: "#404040",
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
    marginBottom: 12,
  },
  paymentTitleDark: {
    color: "#fafafa",
  },
  paymentsList: {
    gap: 8,
    marginBottom: 12,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  paymentItemDark: {
    backgroundColor: "#171717",
    borderColor: "#404040",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDetailText: {
    fontSize: 14,
    color: "#0a0a0a",
  },
  paymentDetailTextDark: {
    color: "#fafafa",
  },
  paymentCategory: {
    fontSize: 12,
    color: "#737373",
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0a0a0a",
  },
  paymentAmountDark: {
    color: "#fafafa",
  },
  paymentTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  statusPaid: {
    color: "#16a34a",
    fontWeight: "600",
  },
  statusPending: {
    color: "#ea580c",
    fontWeight: "600",
  },

  // Legend
  legend: {
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendToday: {
    backgroundColor: "#3b82f6",
  },
  legendPending: {
    backgroundColor: "#fed7aa",
    borderWidth: 1,
    borderColor: "#fb923c",
  },
  legendPendingDark: {
    backgroundColor: "rgba(234, 88, 12, 0.2)",
    borderColor: "#fb923c",
  },
  legendOverdue: {
    backgroundColor: "#ef4444",
  },
  legendPaid: {
    backgroundColor: "#bbf7d0",
    borderWidth: 1,
    borderColor: "#4ade80",
  },
  legendPaidDark: {
    backgroundColor: "rgba(22, 163, 74, 0.2)",
    borderColor: "#4ade80",
  },
  legendText: {
    fontSize: 12,
    color: "#737373",
  },
  legendTextDark: {
    color: "#a3a3a3",
  },
  legendSelected: {
    backgroundColor: "#506266",
    borderWidth: 1,
    borderColor: "#405155",
  },

  // Summary
  summary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC",
  },
  summaryDark: {
    borderTopColor: "#262626",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: "#0a0a0a",
  },
  summaryTitleDark: {
    color: "#fafafa",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
  },
  summaryValueDark: {
    color: "#fafafa",
  },
  summaryValuePending: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ea580c",
  },
  summaryValuePendingDark: {
    color: "#fb923c",
  },
  summaryValuePaid: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
  },
  summaryValuePaidDark: {
    color: "#4ade80",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#737373",
    marginTop: 4,
  },
  summaryLabelDark: {
    color: "#a3a3a3",
  },

  // Loading
  loadingContainer: {
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#737373",
  },
  loadingTextDark: {
    color: "#a3a3a3",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: "center",
    color: "#737373",
  },
  emptyTextDark: {
    color: "#a3a3a3",
  },

  // Error
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: "#737373",
    textAlign: "center",
  },
})