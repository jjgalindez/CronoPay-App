// src/app/auth/callback.tsx
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import { supabase } from "lib/supabase"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleRedirect = async () => {
      const url = await Linking.getInitialURL()
      if (url) {
        const { data } = await supabase.auth.getSession()
        router.replace(
          data.session ? "/(tabs)/inicio" : "/(unauthenticated)/sign-up",
        )
      }
      setLoading(false)
    }

    handleRedirect()
  }, [router])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  return null
}
