import type { Session } from "@supabase/supabase-js"
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import { supabase } from "lib/supabase"
import { useEffect, useState } from "react"
import { ActivityIndicator, View } from "react-native"

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tryHandleUrl = async (url?: string | null) => {
      try {
        // incomingUrl puede venir del listener (url) o de getInitialURL()
        const incomingUrl = url ?? (await Linking.getInitialURL())
        console.log("AuthCallback incomingUrl →", incomingUrl)

        if (!incomingUrl) {
          setLoading(false)
          return
        }

        // parseamos query params (si existen)
        const { queryParams } = Linking.parse(incomingUrl)
        console.log("AuthCallback queryParams raw →", queryParams)

        const code =
          typeof queryParams?.code === "string" ? queryParams.code : undefined
        const error =
          typeof queryParams?.error === "string" ? queryParams.error : undefined

        console.log("AuthCallback code/error →", code, error)

        if (error) {
          console.warn("OAuth provider returned error →", error)
          // Intentamos obtener sesión por si acaso antes de forzar sign-up
          const { data: maybe } = await supabase.auth.getSession()
          if (maybe.session) {
            router.replace("/(tabs)/inicio")
          } else {
            router.replace("/(unauthenticated)/sign-up")
          }
          setLoading(false)
          return
        }

        // Si recibimos code en el deep link, intercambiamos por sesión
        if (code) {
          try {
            const exchange = await supabase.auth.exchangeCodeForSession(code)
            console.log("exchangeCodeForSession →", exchange)
          } catch (ex) {
            console.error("exchangeCodeForSession error →", ex)
          }
        }

        // En algunos entornos (Android/Expo Go) Linking.getInitialURL puede venir sin path/query.
        // Por eso reintentamos leer la sesión varias veces antes de decidir redirigir a sign-up.
        let tries = 0
        let session: Session | null = null
        while (tries < 5 && !session) {
          try {
            const { data } = await supabase.auth.getSession()
            session = data.session
            console.log("getSession attempt", tries, "->", !!session)
            if (session) break
          } catch (e) {
            console.error("getSession error →", e)
          }
          await new Promise((r) => setTimeout(r, 300))
          tries++
        }

        console.log("AuthCallback session set? →", !!session)

        // Si la sesión existe, vamos a inicio; sino fallback a sign-up
        router.replace(
          session ? "/(tabs)/inicio" : "/(unauthenticated)/sign-up",
        )
      } catch (e) {
        console.error("AuthCallback unexpected error →", e)
        // Antes de forzar sign-up, intentamos una última vez obtener la sesión
        try {
          const { data } = await supabase.auth.getSession()
          if (data?.session) {
            router.replace("/(tabs)/inicio")
            return
          }
        } catch (err) {
          console.error("Final getSession attempt failed →", err)
        }
        router.replace("/(unauthenticated)/sign-up")
      } finally {
        setLoading(false)
      }
    }

    // intento inicial
    tryHandleUrl()

    // escuchar deep links que lleguen mientras la app está en foreground
    const sub = Linking.addEventListener("url", ({ url }) => {
      tryHandleUrl(url)
    })
    return () => sub.remove()
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
