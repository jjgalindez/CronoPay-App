// src/hooks/useUsuarioPerfil.ts
import { useCallback, useEffect, useState } from "react"
import { 
  fetchUsuarioPerfil, 
  updateUsuarioPerfil, 
  upsertUsuarioPerfil,
  type UsuarioPerfilRow,
  type UsuarioPerfilUpdate,
  type UsuarioPerfilInsert
} from "../../lib/api/users"

type Options = {
  enabled?: boolean
}

type UseUsuarioPerfilState = {
  data: UsuarioPerfilRow | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  update: (values: UsuarioPerfilUpdate) => Promise<UsuarioPerfilRow>
  upsert: (payload: UsuarioPerfilInsert) => Promise<UsuarioPerfilRow>
}

const DEFAULT_STATE: Omit<UseUsuarioPerfilState, 'update' | 'upsert'> = {
  data: null,
  isLoading: false,
  error: null,
  refetch: async () => {},
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
      console.error('Error fetching user profile:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, enabled])

  const handleUpdate = useCallback(async (values: UsuarioPerfilUpdate): Promise<UsuarioPerfilRow> => {
    if (!userId) {
      throw new Error('No user ID provided')
    }

    try {
      setIsLoading(true)
      setError(null)
      const result = await updateUsuarioPerfil(userId, values)
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      console.error('Error updating user profile:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const handleUpsert = useCallback(async (payload: UsuarioPerfilInsert): Promise<UsuarioPerfilRow> => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await upsertUsuarioPerfil(payload)
      setData(result)
      return result
    } catch (err) {
      setError(err as Error)
      console.error('Error upserting user profile:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  if (!userId || !enabled) {
    return {
      ...DEFAULT_STATE,
      refetch: handleFetch,
      update: handleUpdate,
      upsert: handleUpsert,
    }
  }

  return {
    data,
    isLoading,
    error,
    refetch: handleFetch,
    update: handleUpdate,
    upsert: handleUpsert,
  }
}

// Re-exportar tipos para facilitar el uso
export type { UsuarioPerfilRow, UsuarioPerfilUpdate, UsuarioPerfilInsert }