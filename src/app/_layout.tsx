//src/app/_layout.tsx
import "@/global.css"

import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { Slot } from "expo-router"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

import AuthProvider from "../../providers/AuthProvider"

import { ThemeProvider } from "@/hooks/useTema"
import { initI18n } from "@/i18n"

export default function Layout() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    })
    initI18n().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0C212C" />
      </View>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  )
}
