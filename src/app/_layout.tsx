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
      webClientId:
        "260786178265-k3im15pear08ktgbbp42mu96jv5hlb8j.apps.googleusercontent.com",
      offlineAccess: true,
    })
    initI18n().then(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
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
