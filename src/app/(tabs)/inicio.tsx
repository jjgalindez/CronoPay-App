import { useMemo } from "react"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

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
      <View className="flex-1 justify-between px-6 py-10">
        <View>
          <Text className="text-sm font-medium text-neutral-600">
            Bienvenido de nuevo
          </Text>
          <Text className="mt-2 text-3xl font-bold text-primary-800">
            {displayName}
          </Text>
          <Text className="mt-6 text-base text-neutral-700">
            Gestiona tus finanzas, revisa movimientos y mantén tus cobros al
            día.
          </Text>
        </View>

        <Pressable
          onPress={signOut}
          className="h-12 items-center justify-center rounded-xl bg-primary-500"
        >
          <Text className="text-base font-semibold text-white">
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
