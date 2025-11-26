// src/hooks/useCatalogos.ts
import { useEffect, useState, useCallback } from 'react';
import { fetchCategorias, fetchMetodosPago, CategoriaRow, MetodoPagoRow } from 'lib/api/catalogos';

type CatalogosState = {
categorias: CategoriaRow[];
metodosPago: MetodoPagoRow[];
isLoading: boolean;
error: string | null;
refetch: () => Promise<void>;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useCatalogos(): CatalogosState {
  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPagoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogos = useCallback(async (retryCount = 0): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const [categoriasData, metodosData] = await Promise.all([
        fetchCategorias(),
        fetchMetodosPago(),
      ]);

      // Validar que los datos sean arrays
      if (!Array.isArray(categoriasData) || !Array.isArray(metodosData)) {
        throw new Error('Formato de datos inválido');
      }

      setCategorias(categoriasData);
      setMetodosPago(metodosData);
    } catch (err) {
      // Lógica de reintento
      if (retryCount < MAX_RETRIES) {
        console.warn(`Reintentando carga de catálogos... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          loadCatalogos(retryCount + 1);
        }, RETRY_DELAY * (retryCount + 1));
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar catálogos';
      setError(errorMessage);
      console.error('Error cargando catálogos después de reintentos:', err);

      // Limpiar datos en caso de error
      setCategorias([]);
      setMetodosPago([]);
    } finally {
      if (retryCount === 0 || retryCount >= MAX_RETRIES) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadCatalogos();
  }, [loadCatalogos]);

  return {
    categorias,
    metodosPago,
    isLoading,
    error,
    refetch: () => loadCatalogos(),
  };
}