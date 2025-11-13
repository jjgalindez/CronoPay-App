import { Alert, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../../providers/AuthProvider"
import Box from "../../components/Box"
import Button from "../../components/Button"
import DonutChart, { type DonutSlice } from "../../components/DonutChart"
import MonthYearSelector, {
  type MonthYearValue,
} from "../../components/MonthYearSelector"
import PaymentsList, { type PaymentItem } from "../../components/PaymentsList"
import { useMemo, useState } from "react"

// Datos de ejemplo para el donut con meses
const CATEGORY_DATA: DonutSlice[] = [
  { label: "Suscripciones", value: 150000, color: "#0F5B5C", month: 0 }, // Enero
  { label: "Servicios", value: 250000, color: "#12C48B", month: 0 },
  { label: "Deudores", value: 180000, color: "#FFB020", month: 0 },
  { label: "Otros", value: 81400, color: "#7C4DFF", month: 0 },

  { label: "Suscripciones", value: 160000, color: "#0F5B5C", month: 1 }, // Febrero
  { label: "Servicios", value: 300000, color: "#12C48B", month: 1 },
  { label: "Deudores", value: 120000, color: "#FFB020", month: 1 },
  { label: "Otros", value: 90000, color: "#7C4DFF", month: 1 },

  { label: "Suscripciones", value: 155000, color: "#0F5B5C", month: 10 }, // Noviembre
  { label: "Servicios", value: 280000, color: "#12C48B", month: 10 },
  { label: "Deudores", value: 150000, color: "#FFB020", month: 10 },
  { label: "Otros", value: 76400, color: "#7C4DFF", month: 10 },
]

// Datos de ejemplo para la lista de pagos con meses y categorías
const PAYMENTS_DATA: PaymentItem[] = [
  // Enero
  { id: '1', title: 'Netflix', date: '2025-01-15', amount: 35000, status: 'Pagado', category: 'Suscripciones', iconName: 'tv-outline', iconColor: '#0F5B5C', iconBackgroundColor: '#E8F1FF' },
  { id: '2', title: 'Electricidad', date: '2025-01-20', amount: 89500, status: 'Pagado', category: 'Servicios', iconName: 'flash-outline', iconColor: '#12C48B', iconBackgroundColor: '#E8F9F1' },
  { id: '3', title: 'Spotify', date: '2025-01-10', amount: 16900, status: 'Pagado', category: 'Suscripciones', iconName: 'musical-notes-outline', iconColor: '#0F5B5C', iconBackgroundColor: '#E8F1FF' },
  { id: '4', title: 'Cobro Cliente A', date: '2025-01-25', amount: 120000, status: 'Pagado', category: 'Deudores', iconName: 'person-outline', iconColor: '#FFB020', iconBackgroundColor: '#FFF7E6' },

  // Febrero
  { id: '5', title: 'Netflix', date: '2025-02-15', amount: 35000, status: 'Pagado', category: 'Suscripciones', iconName: 'tv-outline', iconColor: '#0F5B5C', iconBackgroundColor: '#E8F1FF' },
  { id: '6', title: 'Internet', date: '2025-02-05', amount: 55000, status: 'Pagado', category: 'Servicios', iconName: 'wifi-outline', iconColor: '#12C48B', iconBackgroundColor: '#E8F9F1' },
  { id: '7', title: 'Agua', date: '2025-02-18', amount: 28000, status: 'Pagado', category: 'Servicios', iconName: 'water-outline', iconColor: '#12C48B', iconBackgroundColor: '#E8F9F1' },

  // Noviembre
  { id: '8', title: 'Netflix', date: '2025-11-15', amount: 35000, status: 'Pagado', category: 'Suscripciones', iconName: 'tv-outline', iconColor: '#0F5B5C', iconBackgroundColor: '#E8F1FF' },
  { id: '9', title: 'Electricidad', date: '2025-11-20', amount: 89500, status: 'Pendiente', category: 'Servicios', iconName: 'flash-outline', iconColor: '#12C48B', iconBackgroundColor: '#E8F9F1' },
  { id: '10', title: 'Spotify', date: '2025-11-10', amount: 16900, status: 'Pagado', category: 'Suscripciones', iconName: 'musical-notes-outline', iconColor: '#0F5B5C', iconBackgroundColor: '#E8F1FF' },
  { id: '11', title: 'Internet', date: '2025-11-05', amount: 55000, status: 'Pagado', category: 'Servicios', iconName: 'wifi-outline', iconColor: '#12C48B', iconBackgroundColor: '#E8F9F1' },
  { id: '12', title: 'Seguro Auto', date: '2025-11-30', amount: 520000, status: 'Pendiente', category: 'Otros', iconName: 'car-outline', iconColor: '#7C4DFF', iconBackgroundColor: '#F3EEFF' },
  { id: '13', title: 'Cobro Cliente B', date: '2025-11-12', amount: 85000, status: 'Pagado', category: 'Deudores', iconName: 'person-outline', iconColor: '#FFB020', iconBackgroundColor: '#FFF7E6' },
  { id: '14', title: 'Gym', date: '2025-11-01', amount: 45000, status: 'Pagado', category: 'Suscripciones', iconName: 'barbell-outline', iconColor: '#0F5B5C', iconBackgroundColor: '#E8F1FF' },
  { id: '15', title: 'Gas', date: '2025-11-22', amount: 38000, status: 'Pagado', category: 'Servicios', iconName: 'flame-outline', iconColor: '#12C48B', iconBackgroundColor: '#E8F9F1' },
  { id: '16', title: 'Cobro Cliente C', date: '2025-11-28', amount: 65000, status: 'Pendiente', category: 'Deudores', iconName: 'person-outline', iconColor: '#FFB020', iconBackgroundColor: '#FFF7E6' },
  { id: '17', title: 'Amazon Prime', date: '2025-11-08', amount: 18900, status: 'Pagado', category: 'Suscripciones', iconName: 'play-outline', iconColor: '#0F5B5C', iconBackgroundColor: '#E8F1FF' },
  { id: '18', title: 'Mantenimiento', date: '2025-11-14', amount: 76400, status: 'Pagado', category: 'Otros', iconName: 'build-outline', iconColor: '#7C4DFF', iconBackgroundColor: '#F3EEFF' },
]

export default function ReportesScreen() {
  const { session } = useAuth()
  const userId = session?.user?.id ?? null
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

  // Calcular estadísticas dinámicas según el mes seleccionado
  const filteredPayments = useMemo(() => {
    return PAYMENTS_DATA.filter((payment) => {
      const paymentDate = new Date(payment.date)
      return (
        paymentDate.getMonth() === selectedPeriod.month &&
        paymentDate.getFullYear() === selectedPeriod.year
      )
    })
  }, [selectedPeriod])

  const stats = useMemo(() => {
    const total = filteredPayments.length
    const completed = filteredPayments.filter((p) => p.status === "Pagado").length
    const pending = filteredPayments.filter((p) => p.status === "Pendiente").length
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

    return { total, completed, pending, totalAmount }
  }, [filteredPayments])

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
      comparisonPercentage: 12,
      comparisonColor: "#12C48B",
    },
  ], [stats])

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
          <View style={styles.donutCard}>
            <DonutChart
              data={CATEGORY_DATA}
              filterMonth={selectedPeriod.month}
              size={220}
              thickness={28}
              showPercent
            />
          </View>
        </View>

        <View style={styles.paymentsSection}>
          <PaymentsList
            items={PAYMENTS_DATA}
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
})
