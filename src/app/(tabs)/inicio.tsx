import { useMemo } from "react"
import { ScrollView, Text, View, Alert, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import Box from "../../components/Box"
import { useColorScheme } from "nativewind"
import { getCategoryIcon, getCategoryColor } from "../../utils/categoryHelpers"
import { useAuth } from "../../../providers/AuthProvider"
import { usePagos } from "../../hooks/usePagos"
import DonutChart from "../../components/DonutChart"
import PaymentsList from "../../components/PaymentsList"
import { useTranslation } from "react-i18next"

export default function InicioScreen() {
  const { session, signOut } = useAuth()
  const userId = session?.user?.id ?? null
  const { data: pagos } = usePagos(userId)
  const insets = useSafeAreaInsets()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { t } = useTranslation()
  const displayName = useMemo(() => {
    const metadataName = session?.user?.user_metadata?.full_name
    if (metadataName) {
      return metadataName
    }

    const email = session?.user?.email
    if (!email) return t("User")

    const [username] = email.split("@")
    return username
  }, [session, t])

  const recentPayments = useMemo(() => {
    if (!pagos || pagos.length === 0) return []

    const mapped = pagos.map((p, idx) => {
      const categoryName = p.categoria?.nombre ?? t("Others")
      const iconName = getCategoryIcon(categoryName)
      const color = getCategoryColor(idx)

      return {
        id: String((p as any).id_pago ?? p.id_pago ?? Math.random()),
        title: p.titulo || t("Payment"),
        date: p.fecha_vencimiento,
        amount: Number(p.monto) || 0,
        status: p.estado ?? undefined,
        category: categoryName,
        iconName,
        iconColor: "#FFFFFF",
        iconBackgroundColor: color,
      }
    })

    // Ordenar por fecha descendente y tomar los 3 más recientes
    return mapped
      .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
      .slice(0, 3)
  }, [pagos])

  // Preparar contadores para las boxes (mes actual, pendientes, completados)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthCount = useMemo(() => {
    return pagos?.filter(p => {
      const d = new Date(p.fecha_vencimiento)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }).length ?? 0
  }, [pagos, currentMonth, currentYear])

  const pendingsCount = useMemo(() => {
    return pagos?.filter(p => (p.estado ?? "Pendiente") === "Pendiente").length ?? 0
  }, [pagos])

  const completedCount = useMemo(() => {
    return pagos?.filter(p => (p.estado ?? "") === "Pagado").length ?? 0
  }, [pagos])

  const CARD_DATA = useMemo(() => [
    {
      id: 'month',
      title: t('MonthPayment'),
      value: monthCount,
      iconName: 'calendar-outline' as const,
      iconBackgroundColor: isDark ? '#082027' : '#E8F1FF',
      iconColor: isDark ? '#E5E7EB' : '#1B3D48',
      backgroundColor: isDark ? '#171717' : '#F4F8FF',
    },
    {
      id: 'pendings',
      title: t('Pendings'),
      value: pendingsCount,
      valueColor: isDark ? '#FFD59A' : '#FF8A00',
      iconName: 'time-outline' as const,
      iconBackgroundColor: isDark ? '#3A2A18' : '#FFF1E3',
      iconColor: isDark ? '#FFD59A' : '#FF8A00',
      backgroundColor: isDark ? '#171717' : '#FFF7EE',
    },
    {
      id: 'completed',
      title: t('Completed'),
      value: completedCount,
      valueColor: isDark ? '#9EE6C6' : '#12C48B',
      iconName: 'checkmark-done-outline' as const,
      iconBackgroundColor: isDark ? '#073024' : '#E8F9F1',
      iconColor: isDark ? '#9EE6C6' : '#12C48B',
      backgroundColor: isDark ? '#171717' : '#F5FCF8',
    },
  ], [monthCount, pendingsCount, completedCount, isDark, t])

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView className="flex-1 bg-white px-6 py-10 dark:bg-slate-900" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Estadísticas rápidas */}
        <View className="mt-2 flex-row">
          {CARD_DATA.map((card) => (
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
              style={{ flex: 1, marginHorizontal: 6 }}
            />
          ))}
        </View>

        {/* Resumen mensual (gráfico) */}
        <View className="mt-6 bg-slate-100 dark:bg-gray-800 dark:text-white rounded-xl items-center justify-center p-4">
          <DonutChart
            data={[
              { label: t("MonthPayment"), value: pagos ? pagos.filter(p => {
                const now = new Date(); const d = new Date(p.fecha_vencimiento); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length : 0, color: "#12C48B" },
              { label: t("Pendings"), value: pagos ? pagos.filter(p => (p.estado ?? "Pendiente") === "Pendiente").length : 0, color: "#FFB020" },
              { label: t("Completed"), value: pagos ? pagos.filter(p => (p.estado ?? "") === "Pagado").length : 0, color: "#0F5B5C" },
            ]}
            size={200}
            thickness={30}
            showPercent={false}
          />
        </View>

        {/* Próximos vencimientos */}
        <View className="mt-6">
          <PaymentsList items={recentPayments} title={t("NextDueDates")}/>
        </View>

        {/* Botón registrar nuevo pago */}
        <Pressable
          onPress={() => console.log("Registrar nuevo pago")}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-primary-500 dark:bg-primary-700"
        >
          <Text className="text-base font-semibold text-white dark:text-gray-100 ">
            {t("AddNewPayment")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
