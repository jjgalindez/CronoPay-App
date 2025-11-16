import { useMemo } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import PaymentsList from "../../components/PaymentsList"
import DonutChart from "../../components/DonutChart";

import { useAuth } from "../../../providers/AuthProvider"

export default function InicioScreen() {
  const { session, signOut } = useAuth()

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

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1 px-6 py-10">
        <View>
          <Text className="text-sm font-medium text-neutral-600">
            Hola, {displayName} 👋
          </Text>
          <Text className="mt-2 text-base text-neutral-700">
            Aquí tienes el resumen de tus pagos.
          </Text>
        </View>

        {/* Resumen mensual */}
        <View className="mt-6">
          <DonutChart
            data={[
              { label: "Pagos del mes", value: 12, color: "#12C48B" },
              { label: "Pendientes", value: 3, color: "#FFB020" },
              { label: "Completados", value: 9, color: "#0F5B5C" },
            ]}
            size={200}
            thickness={30}
            showPercent={false}
          />
        </View>

        {/* Próximos vencimientos */}
        <View className="mt-6">
          <Text className="text-lg font-semibold text-neutral-800">
            Próximos vencimientos
          </Text>
          <PaymentsList />
        </View>

        {/* Botón registrar nuevo pago */}
        <Pressable
          onPress={() => console.log("Registrar nuevo pago")}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-primary-500"
        >
          <Text className="text-base font-semibold text-white">
            Registrar nuevo pago
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
