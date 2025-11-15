// src/hooks/useSignUp.ts
import { router } from "expo-router"
import { supabase } from "lib/supabase"
import { useState } from "react"

export function useSignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "com.edrickleong.smartbank://auth/callback",
          data: { full_name: name },
        },
      })

      if (error) throw error

      router.push("/(unauthenticated)/confirm-email?email=" + email)
    } catch (err: any) {
      setError(err.message ?? "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    repeatPassword,
    setRepeatPassword,
    error,
    isLoading,
    handleSignUp,
  }
}
