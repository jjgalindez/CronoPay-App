// src/hooks/useGoogleOAuth.ts
import * as Linking from "expo-linking"
import * as WebBrowser from "expo-web-browser"
import { supabase } from "lib/supabase"

export function useGoogleOAuth() {
  const redirectUrl = Linking.createURL("/auth/callback")

  async function signInWithGoogle() {
    console.log("Google redirectTo →", redirectUrl)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    })

    if (error) throw error
    // Espera a que el navegador complete el flujo antes de continuar
    await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)
  }

  return { signInWithGoogle }
}
