//src/app/_layout.tsx
import "@/global.css"

import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { Slot } from "expo-router"
import React, { useEffect } from "react"

import AuthProvider from "../../providers/AuthProvider"
export default function Layout() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "260786178265-k3im15pear08ktgbbp42mu96jv5hlb8j.apps.googleusercontent.com",
      offlineAccess: true,
    })
  }, [])

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  )
}

