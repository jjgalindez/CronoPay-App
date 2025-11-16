// src/hooks/useUsuarioPerfil.ts
import { useCallback, useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

// Definir el tipo basado en tu tabla usuarios_perfil
export type UsuarioPerfilRow = {
  id: string
  nombre: string | null
  avatar_url: string | null
  creado_en: string | null
}

type Options = {
  enabled?: boolean
}

type UseUsuarioPerfilState = {
  data: UsuarioPerfilRow | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const DEFAULT_STATE: UseUsuarioPerfilState = {
  data: null,
  isLoading: false,
  error: null,
  refetch: async () => {},
}

// Función para obtener el perfil desde usuarios_perfil
export const fetchUsuarioPerfil = async (userId: string): Promise<UsuarioPerfilRow> => {
  const { data, error } = await supabase
    .from('usuarios_perfil')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`Error al obtener perfil: ${error.message}`)
  }

  if (!data) {
    throw new Error('Perfil no encontrado')
  }

  return data
}

export function useUsuarioPerfil(
  userId: string | null | undefined,
  options: Options = {},
): UseUsuarioPerfilState {
  const [data, setData] = useState<UsuarioPerfilRow | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const enabled = options.enabled ?? true

  const handleFetch = useCallback(async () => {
    if (!userId || !enabled) return

    try {
      setIsLoading(true)
      setError(null)
      const result = await fetchUsuarioPerfil(userId)
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, enabled])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  if (!userId || !enabled) {
    return {
      ...DEFAULT_STATE,
      refetch: handleFetch,
    }
  }

  return {
    data,
    isLoading,
    error,
    refetch: handleFetch,
  }
}