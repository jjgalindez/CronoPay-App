// src/hooks/useGoogleOAuth.ts
import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"
import { supabase } from "lib/supabase"

export function useGoogleOAuth() {
  const redirectUrl = Linking.createURL("/auth/callback")
  console.log("useGoogleOAuth redirectUrl →", redirectUrl)

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl, scopes: "email profile" },
    })
    if (error) throw error

    console.log("signInWithOAuth data.url →", data?.url)

    // Abrimos el navegador y esperamos el retorno
    const result = await WebBrowser.openAuthSessionAsync(data!.url)
    console.log("openAuthSessionAsync result →", result)
    try {
      WebBrowser.dismissAuthSession()
    } catch {}

    // Si el result incluye la url final con code, procesamos el code inmediatamente
    if (result.type === "success" && typeof result.url === "string") {
      try {
        const parsed = Linking.parse(result.url)
        const code =
          typeof parsed.queryParams?.code === "string"
            ? parsed.queryParams.code
            : undefined
        if (code) {
          console.log("Found code in openAuthSessionAsync result →", code)
          // Intercambiamos el code por sesión aquí para evitar depender de Linking.getInitialURL()
          const exchange = await supabase.auth.exchangeCodeForSession(code)
          console.log("exchangeCodeForSession (from hook) →", exchange)
        } else {
          console.log("No code found in result.url")
        }
      } catch (e) {
        console.error("Failed processing result.url", e)
      }
    }

    // Devolvemos el result por si lo usa quien llame
    return result
  }

  return { signInWithGoogle, redirectUrl }
}
