import { useCallback, useEffect, useState } from "react"

import { fetchCategorias, CategoriaRow } from "../../lib/api/catalogos"

type CategoriasState = {
  data: CategoriaRow[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const DEFAULT_STATE: CategoriasState = {
  data: [],
  isLoading: false,
  error: null,
  refetch: async () => {},
}

export function useCategorias(): CategoriasState {
  const [data, setData] = useState<CategoriaRow[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleFetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await fetchCategorias()
      setData(result)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    handleFetch()
  }, [handleFetch])

  return {
    data,
    isLoading,
    error,
    refetch: handleFetch,
  }
}
