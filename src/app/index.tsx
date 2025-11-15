import { Link, useRouter } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../../providers/AuthProvider"

export default function Page() {
  const { loading, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (session) {
      router.replace("/(tabs)/inicio")
    }
  }, [loading, session, router])

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  if (session) {
    return null
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-4 py-7">
        <View className="flex-1">
          <Text className="text-[13px] font-medium text-neutral-600">
            Bienvenido a CronoPay
          </Text>
          <Text className="mt-1.5 text-[34px] font-bold text-[#0C212C]">
            Gestionar tu dinero nunca ha sido tan fácil
          </Text>
          <Image
            source={require("@/assets/making-your-money.png")}
            className="mt-10 w-full flex-1"
            resizeMode="contain"
          />
        </View>
        <View>
          <Link href="/(unauthenticated)/sign-up" asChild>
            <Pressable className="h-12 w-full items-center justify-center rounded-xl bg-primary-500">
              <Text className="text-[16px] font-semibold text-white">
                Registrase
              </Text>
            </Pressable>
          </Link>
          <Link href="/(unauthenticated)/login" asChild>
            <Pressable className="mt-4 h-12 w-full items-center justify-center rounded-xl bg-neutral-200">
              <Text className="text-[16px] font-semibold text-primary-500">
                Iniciar Sesion
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}
