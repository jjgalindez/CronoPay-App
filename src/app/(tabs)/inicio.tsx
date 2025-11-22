import { useMemo } from "react"
import { ScrollView, Text, View, Alert, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import Box from "../../components/Box"
import { getCategoryIcon, getCategoryColor } from "../../utils/categoryHelpers"
import { useAuth } from "../../../providers/AuthProvider"
import { usePagos } from "../../hooks/usePagos"
import DonutChart from "../../components/DonutChart"
import PaymentsList from "../../components/PaymentsList"

export default function InicioScreen() {
  const { session, signOut } = useAuth()
  const userId = session?.user?.id ?? null
  const { data: pagos } = usePagos(userId)
  const insets = useSafeAreaInsets()

  const displayName = useMemo(() => {
    const metadataName = session?.user?.user_metadata?.full_name
    if (metadataName) {
      return metadataName
    }

    const email = session?.user?.email
    if (!email) return "Usuario"

    const [username] = email.split("@")
    return username
  }, [session])

  const recentPayments = useMemo(() => {
    if (!pagos || pagos.length === 0) return []

    const mapped = pagos.map((p, idx) => {
      const categoryName = p.categoria?.nombre ?? "Otros"
      const iconName = getCategoryIcon(categoryName)
      const color = getCategoryColor(idx)

      return {
        id: String((p as any).id_pago ?? p.id_pago ?? Math.random()),
        title: p.titulo || "Pago",
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1 bg-white px-6 py-10 dark:bg-black" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Estadísticas rápidas */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "stretch",
            justifyContent: "center",
          }}
          className="mt-2"
        >
          <Box
            title="Pagos del mes"
            value={useMemo(() => {
              const now = new Date()
              const month = now.getMonth()
              const year = now.getFullYear()
              return (
                pagos?.filter(p => {
                  const d = new Date(p.fecha_vencimiento)
                  return d.getMonth() === month && d.getFullYear() === year
                }).length ?? 0
              )
            }, [pagos])}
            iconName="calendar-outline"
            valueColor="#0B2E35"
            compact
            style={{ flex: 1, marginHorizontal: 6 }}
          />

          <Box
            title="Pendientes"
            value={useMemo(() => pagos?.filter(p => (p.estado ?? "Pendiente") === "Pendiente").length ?? 0, [pagos])}
            iconName="time-outline"
            valueColor="#FF8A00"
            compact
            style={{ flex: 1, marginHorizontal: 6 }}
          />

          <Box
            title="Completados"
            value={useMemo(() => pagos?.filter(p => (p.estado ?? "") === "Pagado").length ?? 0, [pagos])}
            iconName="checkmark-done-outline"
            valueColor="#12C48B"
            compact
            style={{ flex: 1, marginHorizontal: 6 }}
          />
        </View>

        {/* Resumen mensual (gráfico) */}
        <View className="mt-6">
          <DonutChart
            data={[
              { label: "Pagos del mes", value: pagos ? pagos.filter(p => {
                const now = new Date(); const d = new Date(p.fecha_vencimiento); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
              }).length : 0, color: "#12C48B" },
              { label: "Pendientes", value: pagos ? pagos.filter(p => (p.estado ?? "Pendiente") === "Pendiente").length : 0, color: "#FFB020" },
              { label: "Completados", value: pagos ? pagos.filter(p => (p.estado ?? "") === "Pagado").length : 0, color: "#0F5B5C" },
            ]}
            size={200}
            thickness={30}
            showPercent={false}
          />
        </View>

        {/* Próximos vencimientos */}
        <View className="mt-6">
          <Text className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Próximos vencimientos
          </Text>
          <PaymentsList items={recentPayments} />
        </View>

        {/* Botón registrar nuevo pago */}
        <Pressable
          onPress={() => console.log("Registrar nuevo pago")}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-primary-500 dark:bg-primary-700"
        >
          <Text className="text-base font-semibold text-white dark:text-gray-100 ">
            Registrar nuevo pago
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
