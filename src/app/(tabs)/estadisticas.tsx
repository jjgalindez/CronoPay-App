import { useMemo } from "react"
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../../../providers/AuthProvider"
import { usePagos } from "../../hooks/usePagos"
import { useCategorias } from "../../hooks/useCategorias"
import Box from "../../components/Box"
import LineStatsGraph, {
  type LineStatsPoint,
} from "../../components/LineStatsGraph"
import DonutChart, { type DonutSlice } from "../../components/DonutChart"
import RecentPayments, { type PaymentItem } from "../../components/RecentPayments"
import { formatCurrency } from "../../utils/formatters"
import { getCategoryIcon, CATEGORY_COLORS } from "../../utils/categoryHelpers"
import { getStatusColor, getStatusBackground } from "../../utils/statusHelpers"
import { getMonthName } from "../../utils/dateHelpers"
import { useColorScheme } from "nativewind"
import { useTranslation } from "react-i18next"

export default function EstadisticasScreen() {
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id
  const { data: pagos, isLoading: pagosLoading } = usePagos(userId)
  const { data: categorias, isLoading: categoriasLoading } = useCategorias()

  // Calcular estadísticas del mes actual
  const estadisticasMes = useMemo(() => {
    const hoy = new Date()
    const mesActual = hoy.getMonth()
    const añoActual = hoy.getFullYear()

    const pagosMesActual = pagos.filter((pago) => {
      const fechaPago = new Date(pago.fecha_vencimiento)
      return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === añoActual
    })

    const totalPagos = pagosMesActual.length
    const pagados = pagosMesActual.filter((p) => p.estado === "Pagado").length
    const pendientes = pagosMesActual.filter((p) => p.estado === "Pendiente").length
    const totalMonto = pagosMesActual.reduce((sum, p) => sum + Number(p.monto), 0)

    return {
      totalPagos,
      pagados,
      pendientes,
      totalMonto,
    }
  }, [pagos])

  // Preparar datos para el gráfico de dona (distribución por categoría)
  const donutData = useMemo((): DonutSlice[] => {
    if (!pagos.length || !categorias.length) return []

    const categoriaMap = new Map<string, { nombre: string; total: number }>()

    pagos.forEach((pago) => {
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
      }))
      .sort((a, b) => b.value - a.value)
  }, [pagos, categorias])

  // Preparar datos para el gráfico de líneas (últimos 6 meses)
  const lineGraphData = useMemo((): LineStatsPoint[] => {
    const hoy = new Date()
    const datos: LineStatsPoint[] = []

    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const mes = fecha.getMonth()
      const año = fecha.getFullYear()

      const pagosMes = pagos.filter((pago) => {
        const fechaPago = new Date(pago.fecha_vencimiento)
        return fechaPago.getMonth() === mes && fechaPago.getFullYear() === año
      })

      const totalMes = pagosMes.reduce((sum, p) => sum + Number(p.monto), 0)

      datos.push({
        label: getMonthName(mes, true),
        value: totalMes,
      })
    }

    return datos
  }, [pagos])

  // Preparar pagos recientes (últimos 9 pagos)
  const recentPayments = useMemo((): PaymentItem[] => {
    return pagos
      .slice()
      .sort((a, b) => new Date(b.fecha_vencimiento).getTime() - new Date(a.fecha_vencimiento).getTime())
      .slice(0, 9)
      .map((pago) => ({
        title: pago.titulo,
        date: pago.fecha_vencimiento,
        amount: Number(pago.monto),
        status: pago.estado || t("Pending"),
        iconName: pago.categoria?.nombre ? getCategoryIcon(pago.categoria.nombre) : "wallet-outline",
        iconColor: getStatusColor((pago.estado || t("Pending")) as any),
        iconBackgroundColor: getStatusBackground((pago.estado || t("Pending")) as any),
      }))
  }, [pagos])

  // Datos de las tarjetas
  const CARD_DATA = useMemo(() => [
    {
      id: "pagos",
      title: t("MonthPayment"),
      value: estadisticasMes.totalPagos.toString(),
      iconName: "card-outline" as const,
      iconBackgroundColor: isDark ? '#082027' : '#E8F1FF',
      iconColor: isDark ? '#E5E7EB' : '#1B3D48',
      backgroundColor: isDark ? "#0B1220" : "#F4F8FF",
    },
    {
      id: "pendientes",
      title: t("Pendings"),
      value: estadisticasMes.pendientes.toString(),
      valueColor: isDark ? '#FFD59A' : '#FF6B00',
      iconName: "time-outline" as const,
      iconBackgroundColor: isDark ? '#3A2A18' : '#FFF1E3',
      iconColor: isDark ? '#FFD59A' : '#FF6B00',
      backgroundColor: isDark ? "#0B1220" : "#FFF7EE",
    },
    {
      id: "completados",
      title: t("Completed"),
      value: estadisticasMes.pagados.toString(),
      valueColor: isDark ? '#9EE6C6' : '#1AAE6F',
      iconName: "checkmark-circle-outline" as const,
      iconBackgroundColor: isDark ? '#073024' : '#E8F9F1',
      iconColor: isDark ? '#9EE6C6' : '#1AAE6F',
      backgroundColor: isDark ? "#0B1220" : "#F5FCF8",
    },
    {
      id: "total",
      title: t("TotalMonth"),
      value: `$${formatCurrency(estadisticasMes.totalMonto)}`,
      iconName: "wallet-outline" as const,
      iconBackgroundColor: isDark ? '#1C1333' : '#EEE8FF',
      iconColor: isDark ? '#CDBAFF' : '#6C3CF0',
      backgroundColor: isDark ? "#0B1220" : "#F6F2FF",
    },
  ], [estadisticasMes, isDark])

  if (pagosLoading || categoriasLoading) {
    return (
        <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-slate-900">
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? '#E5E7EB' : '#1B3D48'} />
          <Text className="mt-4 text-neutral-600 dark:text-neutral-400">{t("LoadingStats")}</Text>
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
        <View style={styles.grid}>
          {CARD_DATA.map((card, index) => (
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
              style={[
                styles.gridItem,
                index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight,
              ]}
            />
          ))}
        </View>

        {lineGraphData.length > 0 && (
          <LineStatsGraph
            title={t("PaymentsEvolution")}
            data={lineGraphData}
          />
        )}

        {donutData.length > 0 && (
          <View style={styles.graphWrapper}>
            <View style={[styles.donutCard, { backgroundColor: isDark ? '#0B1220' : '#FFFFFF' }]}>
              <Text style={[styles.donutTitle, { color: isDark ? '#E5E7EB' : '#12343A' }]}>{t("DistributionByCategory")}</Text>
              <View style={styles.donutInner}>
                <DonutChart
                  data={donutData}
                  size={220}
                  thickness={28}
                  showPercent
                />
              </View>
            </View>
          </View>
        )}

        {recentPayments.length > 0 && (
          <RecentPayments items={recentPayments} />
        )}

        {pagos.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-neutral-500 dark:text-neutral-400">{t("NoPaymentsData")}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16
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
  graphWrapper: {
    marginTop: 16,
  }
  ,
  donutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    alignItems: 'center',
  },
  donutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#12343A',
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  donutInner: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})