// hooks/useOptimisticPagos.ts (versión más simple y segura)
import { useState, useCallback } from 'react';
import { PagoWithRelations } from 'lib/api/pagos';

export const useOptimisticPagos = (initialPagos: PagoWithRelations[] = []) => {
  const [pagos, setPagos] = useState<PagoWithRelations[]>(initialPagos);

  const updatePagoInState = useCallback((pagoId: number, updates: Partial<PagoWithRelations>) => {
    setPagos(prev => 
      prev.map(pago => 
        pago.id_pago === pagoId ? { ...pago, ...updates } : pago
      )
    );
  }, []);

  const removePagoFromState = useCallback((pagoId: number) => {
    setPagos(prev => 
      prev.filter(pago => pago.id_pago !== pagoId)
    );
  }, []);

  const setPagosState = useCallback((newPagos: PagoWithRelations[]) => {
    setPagos(newPagos);
  }, []);

  const addPagoToState = useCallback((pago: PagoWithRelations) => {
    setPagos(prev => {
      const newPagos = [...prev, pago];
      return newPagos.sort((a, b) => 
        a.fecha_vencimiento.localeCompare(b.fecha_vencimiento)
      );
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