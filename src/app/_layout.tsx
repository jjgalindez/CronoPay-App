//src/app/_layout.tsx
// Quitar el import web
import "@/global.css"

import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { useFonts } from "expo-font"
import { Slot } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import React, { useEffect } from "react"

import AuthProvider from "../../providers/AuthProvider"


SplashScreen.preventAutoHideAsync()

export default function Layout() {
  GoogleSignin.configure({
    webClientId:
      "260786178265-k3im15pear08ktgbbp42mu96jv5hlb8j.apps.googleusercontent.com",
    offlineAccess: true,
  })

  const [loaded] = useFonts({
    Roboto: require("@/assets/fonts/Roboto-Medium.ttf"),
    RobotoBold: require("@/assets/fonts/Roboto-Bold.ttf"),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) return null

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  )
}

