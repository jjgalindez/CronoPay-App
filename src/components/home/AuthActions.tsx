// src/components/home/AuthActions.tsx
import { Link } from "expo-router"
import { Pressable, Text, View } from "react-native"

export default function AuthActions() {
  return (
    <View className="mt-6">
      <Link href="/(unauthenticated)/sign-up" asChild>
        <Pressable className="h-12 w-full items-center justify-center rounded-xl bg-primary-500">
          <Text className="text-[16px] font-semibold text-white">
            Crear cuenta gratuita
          </Text>
        </Pressable>
      </Link>
      <Link href="/(unauthenticated)/login" asChild>
        <Pressable className="mt-4 h-12 w-full items-center justify-center rounded-xl bg-neutral-200">
          <Text className="text-[16px] font-semibold text-primary-500">
            Iniciar sesión
          </Text>
        </Pressable>
      </Link>
    </View>
  )
}
