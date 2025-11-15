// src/hooks/useAuthSession.ts
import type { Session } from "@supabase/supabase-js"
import { supabase } from "lib/supabase"
import { useEffect, useState } from "react"

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session ?? null)
      setLoading(false)
    })()

    const { data: subscription } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null)
    })

    return () => {
      mounted = false
      subscription?.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
