import { useState, useCallback, useEffect } from 'react';
import { PagoWithRelations } from 'lib/api/pagos';

export const useOptimisticPagos = (initialPagos: PagoWithRelations[] = []) => {
  const [pagos, setPagos] = useState<PagoWithRelations[]>(initialPagos);

  // Debug: log initial state
  useEffect(() => {
    try {
      console.log('[useOptimisticPagos] initialized with count:', pagos?.length ?? 0);
      if (pagos && pagos.length > 0) {
        console.log('[useOptimisticPagos] sample:', JSON.stringify(pagos[0]));
      }
    } catch (e) {
      console.warn('[useOptimisticPagos] logging init error', e);
    }
  }, []);

  const updatePagoInState = useCallback((pagoId: number, updates: Partial<PagoWithRelations>) => {
    setPagos(prev => {
      const next = prev.map(pago =>
        pago.id_pago === pagoId ? { ...pago, ...updates } : pago
      );
      try { console.log('[useOptimisticPagos] updatePagoInState', { pagoId, updates, nextCount: next.length }); } catch(e){}
      return next;
    });
  }, []);

  const removePagoFromState = useCallback((pagoId: number) => {
    setPagos(prev => {
      const next = prev.filter(pago => pago.id_pago !== pagoId);
      try { console.log('[useOptimisticPagos] removePagoFromState', { pagoId, nextCount: next.length }); } catch(e){}
      return next;
    });
  }, []);

  const setPagosState = useCallback((newPagos: PagoWithRelations[]) => {
    try { console.log('[useOptimisticPagos] setPagosState count:', newPagos?.length ?? 0); } catch(e){}
    setPagos(newPagos);
  }, []);

  const addPagoToState = useCallback((pago: PagoWithRelations) => {
    setPagos(prev => {
      const newPagos = [...prev, pago];
      const sorted = newPagos.sort((a, b) =>
        a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)
      );
      try { console.log('[useOptimisticPagos] addPagoToState newCount:', sorted.length, 'addedId:', pago?.id_pago); } catch(e){}
      return sorted;
    });
  }, []);

  return {
    pagos,
    updatePagoInState,
    removePagoFromState,
    setPagosState,
    addPagoToState,
  };
};