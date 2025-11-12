//providers/AuthProvider.tsx
import { Session } from "@supabase/supabase-js"
import { router } from "expo-router"
import React, { createContext, useState, useEffect, useContext } from "react"

import { supabase } from "../lib/supabase"

type AuthData = {
  loading: boolean
  session: Session | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthData>({
  loading: true,
  session: null,
  signOut: async () => {},
})

interface Props {
  children: React.ReactNode
}

export default function AuthProvider({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    //  Obtener sesión inicial
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(data.session)
      } catch (error) {
        console.error("Error fetching session", error)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()

    //  Escuchar cambios de sesión en tiempo real
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, authSession) => {
        setSession(authSession)

        //  Redirección automática según estado
        if (event === "SIGNED_IN" && authSession) {
          router.replace("/(tabs)/inicio")
        }
        if (event === "SIGNED_OUT") {
          router.replace("/(unauthenticated)/login")
        }
      },
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  //  Cerrar sesión
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out", error)
    } finally {
      setSession(null)
      router.replace("/(unauthenticated)/login")
    }
  }

  return (
    <AuthContext.Provider value={{ loading, session, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
