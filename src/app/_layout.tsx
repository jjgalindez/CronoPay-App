//src/app/_layout.tsx
import "@/global.css"
import { useFonts } from "expo-font"
import { Slot } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import * as WebBrowser from "expo-web-browser"
import React, { useEffect } from "react"

import AuthProvider from "../../providers/AuthProvider"

WebBrowser.maybeCompleteAuthSession()

SplashScreen.preventAutoHideAsync()

export default function Layout() {
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
