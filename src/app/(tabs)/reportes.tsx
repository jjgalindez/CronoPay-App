import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native"
import showToast from "../../utils/toast"
import { useColorScheme } from "nativewind"
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
import { formatCurrency } from "../../utils/formatters"
import { getCategoryIcon, CATEGORY_COLORS } from "../../utils/categoryHelpers"
import { getStatusColors } from "../../utils/statusHelpers"
import { getMonthNames, filterByMonth, getPreviousMonth } from "../../utils/dateHelpers"
import { useTranslation } from "react-i18next"

export default function ReportesScreen() {
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { t } = useTranslation()

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

  // Filtrar pagos por mes/año seleccionado
  const filteredPayments = useMemo(() => {
    return filterByMonth(pagos, selectedPeriod.month, selectedPeriod.year)
  }, [pagos, selectedPeriod])

  // Calcular estadísticas dinámicas
  const stats = useMemo(() => {
    const total = filteredPayments.length
    const completed = filteredPayments.filter((p) => p.estado === "Pagado").length
    const pending = filteredPayments.filter((p) => p.estado === "Pendiente").length
    const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.monto), 0)

    // Calcular comparación con mes anterior
    const { month: prevMonth, year: prevYear } = getPreviousMonth(
      selectedPeriod.month,
      selectedPeriod.year
    )

    const prevMonthPayments = filterByMonth(pagos, prevMonth, prevYear)
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
      const categoriaNombre = pago.categoria?.nombre || t("Uncategoryed")
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
        const statusColors = getStatusColors((pago.estado || "Pendiente") as any, isDark)
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
  useMemo(() => [
    {
      id: "pagos",
      title: t("TotalPayments"),
      value: String(stats.total),
      iconName: "receipt-outline" as const,
      iconBackgroundColor: "#E8F1FF",
      iconColor: "#1B3D48",
      backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
      showProgress: true,
      currentAmount: stats.completed,
      totalAmount: stats.total,
      progressColor: "#12C48B",
    },
    {
      id: "completados",
      title: t("Completed"),
      value: String(stats.completed),
      valueColor: "#12C48B",
      iconName: "checkmark-circle-outline" as const,
      iconBackgroundColor: "#E8F9F1",
      iconColor: "#12C48B",
      backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
      showProgress: true,
      currentAmount: stats.completed,
      totalAmount: stats.total,
      progressColor: "#12C48B",
    },
    {
      id: "pendientes",
      title: t("Pendings"),
      value: String(stats.pending),
      valueColor: "#FF6B00",
      iconName: "time-outline" as const,
      iconBackgroundColor: "#FFF1E3",
      iconColor: "#FF6B00",
      backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
      showProgress: true,
      currentAmount: stats.pending,
      totalAmount: stats.total,
      progressColor: "#FF6B00",
    },
    {
      id: "total",
      title: t("TotalAmount"),
      value: `$${formatCurrency(stats.totalAmount)}`,
      iconName: "cash-outline" as const,
      iconBackgroundColor: "#EEE8FF",
      iconColor: "#1B3D48",
      backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
      showComparison: true,
      comparisonText: t("VsLastMonth"),
      comparisonPercentage: stats.comparisonPercentage,
      comparisonColor: stats.comparisonPercentage >= 0 ? "#12C48B" : "#FF6B00",
    },
  ], [stats, isDark])

  if (pagosLoading || categoriasLoading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-slate-900">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? '#E5E7EB' : '#1B3D48'} />
          <Text className="mt-4 text-neutral-600 dark:text-neutral-400">{t("LoadingReports")}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-slate-900">
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <MonthYearSelector
          label={t("SelectMonthMessage")}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          minYear={2020}
          maxYear={2030}
        />

        <View style={styles.grid}>
          <Box
            iconName="card-outline"
            iconColor={isDark ? '#E5E7EB' : '#2791B5'}
            iconBackgroundColor={isDark ? '#082027' : '#E8F4F8'}
            title={t("TotalPayments")}
            value={String(stats.total)}
            backgroundColor={isDark ? "#0B1220" : "#FFFFFF"}
            showProgress
            currentAmount={stats.completed}
            totalAmount={stats.total}
            progressColor={isDark ? '#9EE6C6' : '#12C48B'}
            style={[styles.gridItem, styles.gridItemLeft]}
          />
          <Box
            iconName="checkmark-circle-outline"
            iconColor={isDark ? '#9EE6C6' : '#12C48B'}
            iconBackgroundColor={isDark ? '#073024' : '#E6F9F3'}
            title={t("Completed")}
            value={String(stats.completed)}
            backgroundColor={isDark ? "#0B1220" : "#FFFFFF"}
            showProgress
            currentAmount={stats.completed}
            totalAmount={stats.total}
            progressColor={isDark ? '#9EE6C6' : '#12C48B'}
            style={[styles.gridItem, styles.gridItemRight]}
          />
          <Box
            iconName="time-outline"
            iconColor={isDark ? '#FFD59A' : '#FF6B00'}
            iconBackgroundColor={isDark ? '#3A2A18' : '#FFF1E3'}
            title={t("Pendings")}
            value={String(stats.pending)}
            backgroundColor={isDark ? "#0B1220" : "#FFFFFF"}
            showProgress
            currentAmount={stats.pending}
            totalAmount={stats.total}
            progressColor={isDark ? '#FFD59A' : '#FF6B00'}
            style={[styles.gridItem, styles.gridItemLeft]}
          />
          <Box
            iconName="cash-outline"
            iconColor={isDark ? '#CDBAFF' : '#7C4DFF'}
            iconBackgroundColor={isDark ? '#1C1333' : '#F3EEFF'}
            title={t("TotalAmount")}
            value={`$${formatCurrency(stats.totalAmount)}`}
            backgroundColor={isDark ? "#0B1220" : "#FFFFFF"}
            showComparison
            comparisonText={stats.comparisonPercentage >= 0 ? t("VsLastMonth") : t("VsLastMonth")}
            comparisonPercentage={stats.comparisonPercentage}
            comparisonColor={stats.comparisonPercentage >= 0 ? "#12C48B" : "#FF6B6B"}
            style={[styles.gridItem, styles.gridItemRight]}
          />
        </View>

        <View style={styles.chartSection}>
          <Text className="text-lg font-bold text-[#1B3D48] dark:text-gray-100 mb-4">
            {t("DistributionByCategory")} - {getMonthNames()[selectedPeriod.month]}
          </Text>
          {donutData.length > 0 ? (
            <View className="bg-white dark:bg-[#0B1220] rounded-[18px] p-4 mt-3 shadow-sm items-center">
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
              <Text className="text-sm text-[#6B7280] dark:text-neutral-400 text-center">
                {t("NoCategoryData")}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.paymentsSection}>
          <PaymentsList
            items={paymentsListData}
            filterMonth={selectedPeriod.month}
            title={`${t("PaymentsDetails")} - ${getMonthNames()[selectedPeriod.month]}`}
          />
        </View>

        <View style={styles.exportSection}>
          <Text className="text-lg font-bold text-[#1B3D48] dark:text-gray-100 mb-4">{t("ExportReport")}</Text>

          <Button
            label={t("DownloadPDF")}
            icon="document-text"
            backgroundColor="#0B2B34"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            size="large"
            onPress={() => showToast(t("WIPPdf"))}
            style={styles.exportButton}
          />

          <Button
            label={t("ExportExcel")}
            icon="document"
            backgroundColor="#12C48B"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            size="large"
            onPress={() => showToast(t("WIPExcel"))}
            style={styles.exportButton}
          />

          <Button
            label={t("SendMail")}
            icon="mail"
            backgroundColor="#5B6B73"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
            size="large"
            onPress={() => showToast(t("WIPEmail"))}
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
