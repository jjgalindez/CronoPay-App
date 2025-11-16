import { useCallback, useEffect, useMemo, useState } from "react"

import { 
  fetchPagos, 
  createPago,
  updatePago,
  deletePago,
  setPagoEstado,
  type PagoWithRelations,
  type PagoInsert,
  type PagoUpdate
} from "../../lib/api"

type Options = {
  enabled?: boolean
}

type PagosState = {
  data: PagoWithRelations[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  create: (payload: PagoInsert) => Promise<PagoWithRelations>
  update: (pagoId: number, values: PagoUpdate) => Promise<PagoWithRelations>
  remove: (pagoId: number) => Promise<void>
  setEstado: (pagoId: number, estado: "Pendiente" | "Pagado") => Promise<PagoWithRelations>
}

const DEFAULT_STATE: Omit<PagosState, 'create' | 'update' | 'remove' | 'setEstado'> = {
  data: [],
  isLoading: false,
  error: null,
  refetch: async () => {},
}

export function usePagos(
  userId: string | null | undefined,
  options: Options = {},
): PagosState {
  const [data, setData] = useState<PagoWithRelations[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const enabled = useMemo(() => options.enabled ?? true, [options.enabled])

  const handleFetch = useCallback(async () => {
    if (!userId || !enabled) return

    try {
      setIsLoading(true)
      setError(null)
      const result = await fetchPagos(userId)
      setData(result)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching pagos:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, enabled])

  const handleCreate = useCallback(async (payload: PagoInsert): Promise<PagoWithRelations> => {
    if (!userId) {
      throw new Error('No user ID provided')
    }

    try {
      setIsLoading(true)
      setError(null)
      const result = await createPago({ ...payload, id_usuario: userId })
      await handleFetch() // Refrescar la lista
      return result
    } catch (err) {
      setError(err as Error)
      console.error('Error creating pago:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId, handleFetch])

  const handleUpdate = useCallback(async (pagoId: number, values: PagoUpdate): Promise<PagoWithRelations> => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await updatePago(pagoId, values)
      await handleFetch() // Refrescar la lista
      return result
    } catch (err) {
      setError(err as Error)
      console.error('Error updating pago:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [handleFetch])

  const handleRemove = useCallback(async (pagoId: number): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      await deletePago(pagoId)
      await handleFetch() // Refrescar la lista
    } catch (err) {
      setError(err as Error)
      console.error('Error deleting pago:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [handleFetch])

  const handleSetEstado = useCallback(async (pagoId: number, estado: "Pendiente" | "Pagado"): Promise<PagoWithRelations> => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await setPagoEstado(pagoId, estado)
      await handleFetch() // Refrescar la lista
      return result
    } catch (err) {
      setError(err as Error)
      console.error('Error setting pago estado:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [handleFetch])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  if (!userId || !enabled) {
    return {
      ...DEFAULT_STATE,
      refetch: handleFetch,
      create: handleCreate,
      update: handleUpdate,
      remove: handleRemove,
      setEstado: handleSetEstado,
    }
  }

  return {
    data,
    isLoading,
    error,
    refetch: handleFetch,
    create: handleCreate,
    update: handleUpdate,
    remove: handleRemove,
    setEstado: handleSetEstado,
  }
}

// Re-exportar tipos para facilitar el uso
export type { PagoWithRelations, PagoInsert, PagoUpdate }
