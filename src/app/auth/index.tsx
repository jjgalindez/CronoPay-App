import { router } from "expo-router"
import { useEffect } from "react"
import { View, Text } from "react-native"

export default function AuthRedirect() {
  useEffect(() => {
    // Supabase ya guarda la sesión en AsyncStorage
    // Aquí puedes redirigir al onboarding
    router.replace("/(unauthenticated)/login")
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Procesando autenticación...</Text>
    </View>
  )
}
