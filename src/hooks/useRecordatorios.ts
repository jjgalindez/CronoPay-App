import { useCallback, useEffect, useState } from "react"
import {
  fetchRecordatoriosByPago,
  fetchRecordatorioById,
  fetchRecordatoriosProximos,
  createRecordatorio,
  updateRecordatorio,
  deleteRecordatorio,
  deleteRecordatoriosByPago,
  type RecordatorioRow,
  type RecordatorioInsert,
  type RecordatorioUpdate,
} from "../../lib/api/recordatorios"
import { supabase } from "../../lib/supabase"

type UseRecordatoriosResult = {
  data: Array<RecordatorioRow & { pago?: any }>
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  loadByPago: (pagoId: number) => Promise<RecordatorioRow[]>
  loadProximosByPago: (pagoId: number, dias?: number) => Promise<RecordatorioRow[]>
  loadRecent: (limit?: number) => Promise<Array<RecordatorioRow & { pago?: any }>>
  create: (payload: RecordatorioInsert) => Promise<RecordatorioRow>
  update: (id: number, values: RecordatorioUpdate) => Promise<RecordatorioRow>
  remove: (id: number) => Promise<void>
  removeByPago: (pagoId: number) => Promise<void>
}

export function useRecordatorios(): UseRecordatoriosResult {
  const [data, setData] = useState<Array<RecordatorioRow & { pago?: any }>>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const loadByPago = useCallback(async (pagoId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await fetchRecordatoriosByPago(pagoId)
      setData(list as any)
      return list
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadProximosByPago = useCallback(async (pagoId: number, dias: number = 7) => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await fetchRecordatoriosProximos(pagoId, dias)
      setData(list as any)
      return list
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Convenience: cargar recordatorios recientes junto con su pago relacionado
  const loadRecent = useCallback(async (limit: number = 20) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: result, error } = await supabase
        .from("recordatorio")
        .select("*, pago(*)")
        .order("fecha_aviso", { ascending: true })
        .order("hora", { ascending: true })
        .limit(limit)

      if (error) throw error

      // cada item tendrá .pago si existe la relación
      setData((result as any) ?? [])
      return (result as any) ?? []
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    // por defecto no sabemos qué cargar; intentamos cargar recientes
    await loadRecent()
  }, [loadRecent])

  const handleCreate = useCallback(async (payload: RecordatorioInsert) => {
    try {
      setIsLoading(true)
      setError(null)
      const created = await createRecordatorio(payload)
      // actualizar estado local: añadir al inicio
      setData((d) => [created as any, ...d])
      return created
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleUpdate = useCallback(async (id: number, values: RecordatorioUpdate) => {
    try {
      setIsLoading(true)
      setError(null)
      const updated = await updateRecordatorio(id, values)
      setData((d) => d.map((it) => (it.id_recordatorio === id ? (updated as any) : it)))
      return updated
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRemove = useCallback(async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await deleteRecordatorio(id)
      setData((d) => d.filter((it) => it.id_recordatorio !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRemoveByPago = useCallback(async (pagoId: number) => {
    try {
      setIsLoading(true)
      setError(null)
      await deleteRecordatoriosByPago(pagoId)
      setData((d) => d.filter((it) => it.id_pago !== pagoId))
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // cargar recientes al montar para facilitar previews
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const recent = await loadRecent(10)
        if (!mounted) return
        setData(recent as any)
      } catch (err) {
        // ya manejado en loadRecent
      }
    })()

    return () => {
      mounted = false
    }
  }, [loadRecent])

  return {
    data,
    isLoading,
    error,
    refetch,
    loadByPago,
    loadProximosByPago,
    loadRecent,
    create: handleCreate,
    update: handleUpdate,
    remove: handleRemove,
    removeByPago: handleRemoveByPago,
  }
}

export default useRecordatorios
