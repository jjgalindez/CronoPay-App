// src/components/home/AuthActions.tsx
import { Link } from "expo-router"
import React from "react"
import { Pressable, Text, View } from "react-native"

const AuthActions = React.memo(() => {
  return (
    <View className="my-6 gap-3">
      <Link href="/(unauthenticated)/sign-up" asChild>
        <Pressable className="h-12 w-full items-center justify-center rounded-xl bg-primary-500 active:opacity-80">
          <Text className="text-[16px] font-semibold text-white">
            Crear cuenta gratuita
          </Text>
        </Pressable>
      </Link>
      <Link href="/(unauthenticated)/login" asChild>
        <Pressable className="h-12 w-full items-center justify-center rounded-xl bg-neutral-200 active:opacity-80">
          <Text className="text-[16px] font-semibold text-primary-500">
            Iniciar sesión
          </Text>
        </Pressable>
      </Link>
    </View>
  )
})

AuthActions.displayName = "AuthActions"

export default AuthActions
