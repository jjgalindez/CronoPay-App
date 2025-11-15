import { Alert, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../../providers/AuthProvider"
import { usePagos } from "../../hooks/usePagos"
import { useCategorias } from "../../hooks/useCategorias"
import Box from "../../components/Box"
import Button from "../../components/Button"
import DonutChart, { type DonutSlice } from "../../components/DonutChart"
import MonthYearSelector, {
  type MonthYearValue,
} from "../../components/MonthYearSelector"
import PaymentsList, { type PaymentItem } from "../../components/PaymentsList"
import { useMemo, useState } from "react"

// Colores para las categorías
const CATEGORY_COLORS = ["#0F5B5C", "#12C48B", "#FFB020", "#7C4DFF", "#FF6B6B", "#3AA9FF"]

// Mapeo de iconos por categoría
function getCategoryIcon(categoria: string): string {
  const iconMap: Record<string, string> = {
    "Suscripción": "tv-outline",
    "Suscripciones": "tv-outline",
    "Servicios": "flash-outline",
    "Deudores": "people-outline",
    "Transporte": "car-outline",
    "Comida": "fast-food-outline",
    "Vivienda": "home-outline",
    "Salud": "medical-outline",
    "Educación": "school-outline",
    "Entretenimiento": "game-controller-outline",
    "Otros": "ellipsis-horizontal-outline",
  }
  return iconMap[categoria] || "wallet-outline"
}

// Mapeo de colores por estado
const STATUS_COLOR_MAP: Record<string, { iconColor: string; iconBg: string }> = {
  "Pagado": { iconColor: "#12C48B", iconBg: "#E8F9F1" },
  "Pendiente": { iconColor: "#FFB020", iconBg: "#FFF7E6" },
  "Vencido": { iconColor: "#FF3B30", iconBg: "#FFEBEB" },
}

export default function ReportesScreen() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const { data: pagos, isLoading: pagosLoading } = usePagos(userId)
  const { data: categorias, isLoading: categoriasLoading } = useCategorias()
  const now = new Date()

  // Estado del selector de mes/año
  const [selectedPeriod, setSelectedPeriod] = useState<MonthYearValue>({
    month: now.getMonth(),
    year: now.getFullYear(),
  })

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  // Filtrar pagos por mes/año seleccionado
  const filteredPayments = useMemo(() => {
    return pagos.filter((pago) => {
      const paymentDate = new Date(pago.fecha_vencimiento)
      return (
        paymentDate.getMonth() === selectedPeriod.month &&
        paymentDate.getFullYear() === selectedPeriod.year
      )
    })
  }, [pagos, selectedPeriod])

  // Calcular estadísticas dinámicas
  const stats = useMemo(() => {
    const total = filteredPayments.length
    const completed = filteredPayments.filter((p) => p.estado === "Pagado").length
    const pending = filteredPayments.filter((p) => p.estado === "Pendiente").length
    const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.monto), 0)

    // Calcular comparación con mes anterior
    const prevMonth = selectedPeriod.month === 0 ? 11 : selectedPeriod.month - 1
    const prevYear = selectedPeriod.month === 0 ? selectedPeriod.year - 1 : selectedPeriod.year
    
    const prevMonthPayments = pagos.filter((pago) => {
      const paymentDate = new Date(pago.fecha_vencimiento)
      return (
        paymentDate.getMonth() === prevMonth &&
        paymentDate.getFullYear() === prevYear
      )
    })
    
    const prevMonthAmount = prevMonthPayments.reduce((sum, p) => sum + Number(p.monto), 0)
    const comparisonPercentage = prevMonthAmount > 0 
      ? Math.round(((totalAmount - prevMonthAmount) / prevMonthAmount) * 100)
      : 0

    return { total, completed, pending, totalAmount, comparisonPercentage }
  }, [filteredPayments, pagos, selectedPeriod])

  // Preparar datos para el gráfico de dona (distribución por categoría)
  const donutData = useMemo((): DonutSlice[] => {
    if (!filteredPayments.length) return []

    const categoriaMap = new Map<string, { nombre: string; total: number }>()

    filteredPayments.forEach((pago) => {
      const categoriaNombre = pago.categoria?.nombre || "Sin categoría"
      const existing = categoriaMap.get(categoriaNombre)
      if (existing) {
        existing.total += Number(pago.monto)
      } else {
        categoriaMap.set(categoriaNombre, {
          nombre: categoriaNombre,
          total: Number(pago.monto),
        })
      }
    })

    const totalGeneral = Array.from(categoriaMap.values()).reduce(
      (sum, cat) => sum + cat.total,
      0
    )

    return Array.from(categoriaMap.values())
      .map((cat, index) => ({
        label: cat.nombre,
        value: totalGeneral > 0 ? (cat.total / totalGeneral) * 100 : 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        month: selectedPeriod.month,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredPayments, selectedPeriod.month])

  // Preparar lista de pagos para PaymentsList
  const paymentsListData = useMemo((): PaymentItem[] => {
    return filteredPayments
      .sort((a, b) => new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime())
      .map((pago) => {
        const statusColors = STATUS_COLOR_MAP[pago.estado || "Pendiente"] || STATUS_COLOR_MAP["Pendiente"]
        return {
          id: String(pago.id_pago),
          title: pago.titulo,
          date: pago.fecha_vencimiento,
          amount: Number(pago.monto),
          status: pago.estado || "Pendiente",
          category: pago.categoria?.nombre || "Sin categoría",
          iconName: pago.categoria?.nombre ? getCategoryIcon(pago.categoria.nombre) : "wallet-outline",
          iconColor: statusColors.iconColor,
          iconBackgroundColor: statusColors.iconBg,
        }
      })
  }, [filteredPayments])

  // Tarjetas dinámicas
  const dynamicCards = useMemo(() => [
    {
      id: "pagos",
      title: "Pagos Totales",
      value: String(stats.total),
      iconName: "receipt-outline" as const,
      iconBackgroundColor: "#E8F1FF",
      iconColor: "#1B3D48",
      backgroundColor: "#FFFFFF",
      showProgress: true,
      currentAmount: stats.completed,
      totalAmount: stats.total,
      progressColor: "#12C48B",
    },
    {
      id: "completados",
      title: "Completados",
      value: String(stats.completed),
      valueColor: "#12C48B",
      iconName: "checkmark-circle-outline" as const,
      iconBackgroundColor: "#E8F9F1",
      iconColor: "#12C48B",
      backgroundColor: "#FFFFFF",
      showProgress: true,
      currentAmount: stats.completed,
      totalAmount: stats.total,
      progressColor: "#12C48B",
    },
    {
      id: "pendientes",
      title: "Pendientes",
      value: String(stats.pending),
      valueColor: "#FF6B00",
      iconName: "time-outline" as const,
      iconBackgroundColor: "#FFF1E3",
      iconColor: "#FF6B00",
      backgroundColor: "#FFFFFF",
      showProgress: true,
      currentAmount: stats.pending,
      totalAmount: stats.total,
      progressColor: "#FF6B00",
    },
    {
      id: "total",
      title: "Monto Total",
      value: `$${new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(stats.totalAmount)}`,
      iconName: "cash-outline" as const,
      iconBackgroundColor: "#EEE8FF",
      iconColor: "#1B3D48",
      backgroundColor: "#FFFFFF",
      showComparison: true,
      comparisonText: "vs mes anterior",
      comparisonPercentage: stats.comparisonPercentage,
      comparisonColor: stats.comparisonPercentage >= 0 ? "#12C48B" : "#FF6B00",
    },
  ], [stats])

  if (pagosLoading || categoriasLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B3D48" />
          <Text className="mt-4 text-neutral-600">Cargando reportes...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <MonthYearSelector
          label="Selecciona el mes para ver el resumen de tus pagos"
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          minYear={2020}
          maxYear={2030}
        />

        <View style={styles.grid}>
          {dynamicCards.map((card, index) => (
            <Box
              key={card.id}
              title={card.title}
              value={card.value}
              valueColor={card.valueColor}
              iconName={card.iconName}
              iconColor={card.iconColor}
              iconBackgroundColor={card.iconBackgroundColor}
              backgroundColor={card.backgroundColor}
              compact
              showProgress={card.showProgress}
              currentAmount={card.currentAmount}
              totalAmount={card.totalAmount}
              progressColor={card.progressColor}
              showComparison={card.showComparison}
              comparisonText={card.comparisonText}
              comparisonPercentage={card.comparisonPercentage}
              comparisonColor={card.comparisonColor}
              style={[
                styles.gridItem,
                index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
              ]}
            />
          ))}
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>
            Distribución por Categoría - {monthNames[selectedPeriod.month]}
          </Text>
          {donutData.length > 0 ? (
            <View style={styles.donutCard}>
              <DonutChart
                data={donutData}
                filterMonth={selectedPeriod.month}
                size={220}
                thickness={28}
                showPercent
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hay datos de categorías para este mes
              </Text>
            </View>
          )}
        </View>

        <View style={styles.paymentsSection}>
          <PaymentsList
            items={paymentsListData}
            filterMonth={selectedPeriod.month}
            title={`Detalle de Pagos - ${monthNames[selectedPeriod.month]}`}
          />
        </View>

        <View style={styles.exportSection}>
          <Text style={styles.sectionTitle}>Exportar Reporte</Text>

          <Button
            label="Descargar PDF"
            icon="document-text"
            backgroundColor="#0B2B34"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            size="large"
            onPress={() => Alert.alert("Work in Progress", "La función de exportar PDF estará disponible próximamente.")}
            style={styles.exportButton}
          />

          <Button
            label="Exportar Excel"
            icon="document"
            backgroundColor="#12C48B"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            size="large"
            onPress={() => Alert.alert("Work in Progress", "La función de exportar Excel estará disponible próximamente.")}
            style={styles.exportButton}
          />

          <Button
            label="Enviar por Correo"
            icon="mail"
            backgroundColor="#5B6B73"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            size="large"
            onPress={() => Alert.alert("Work in Progress", "La función de enviar por correo estará disponible próximamente.")}
            style={styles.exportButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  pickerWrapper: {
    marginTop: 24,
  },
  summarySection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B3D48",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
  gridItemLeft: {
    marginRight: 6,
  },
  gridItemRight: {
    marginLeft: 6,
  },
  comingSoonCard: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  chartSection: {
    marginTop: 24,
  },
  donutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    alignItems: "center",
  },
  paymentsSection: {
    marginTop: 24,
  },
  exportSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  exportButton: {
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 32,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
})
