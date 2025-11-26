import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../../../providers/AuthProvider"
import { usePagos } from "../../hooks/usePagos"
import { AddPaymentModal } from "../../components/AddPaymentModal"

function PagoCard({
  monto,
  fecha,
  categoria,
  estado,
}: {
  monto: string
  fecha: string
  categoria: string | null
  estado: string | null
}) {
  const formattedDate = new Date(fecha).toLocaleDateString()
  const statusColor = estado === "Pagado" ? "#1B3D48" : "#B08A00"

  return (
    <View className="mb-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
      <Text className="text-lg font-semibold text-primary-800 dark:text-primary-400">
        ${parseFloat(monto).toFixed(2)}
      </Text>
      <Text className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
        {categoria ?? "Sin categoría"}
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
          Vence: {formattedDate}
        </Text>
        <Text style={{ color: statusColor, fontSize: 12, fontWeight: '600' }}>
          {estado ?? "Pendiente"}
        </Text>
      </View>
    </View>
  )
}

export default function PagosScreen() {
  const { session } = useAuth()
  const userId = session?.user?.id ?? null
  const { data, isLoading, error, refetch } = usePagos(userId)

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-slate-900">
      <View className="flex-1 px-6 py-6">
        <Text className="text-2xl font-bold text-primary-900 dark:text-primary-300">Pagos</Text>
        <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Revisa tus obligaciones próximas y mantente al día.
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error.message}
            </Text>
          </View>
        ) : null}

        {isLoading && data.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#1B3D48" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => String(item.id_pago)}
            renderItem={({ item }) => (
              <PagoCard
                monto={item.monto}
                fecha={item.fecha_vencimiento}
                categoria={item.categoria?.nombre ?? null}
                estado={item.estado}
              />
            )}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View className="mt-16 items-center">
                <Text className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                  No hay pagos registrados aún.
                </Text>
                <Text className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  Puedes comenzar añadiendo uno desde la versión web o
                  implementando el flujo de creación en esta pantalla.
                </Text>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <AddPaymentModal onPaymentAdded={refetch} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  errorContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
})