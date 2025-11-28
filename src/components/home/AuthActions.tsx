// src/components/home/AuthActions.tsx
import { Link } from "expo-router"
import React from "react"
import { useTranslation } from "react-i18next"
import { Pressable, Text, View } from "react-native"

const AuthActions = React.memo(() => {
  const { t } = useTranslation()
  return (
    <View className="gap-3 my-6">
      <View>
        <Link href="/(unauthenticated)/sign-up" asChild>
          <Pressable className="h-12 w-full items-center justify-center rounded-xl bg-primary-500 active:opacity-80">
            <Text className="text-[16px] font-semibold text-white">
              {t("home.signUpButton")}
            </Text>
          </Pressable>
        </Link>
      </View>
      <View className="my-4">
        <Link href="/(unauthenticated)/login" asChild>
          <Pressable className="h-12 w-full items-center justify-center rounded-xl bg-neutral-200 active:opacity-80">
            <Text className="text-[16px] font-semibold text-primary-500">
              {t("home.loginButton")}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
})

AuthActions.displayName = "AuthActions"

export default AuthActions
