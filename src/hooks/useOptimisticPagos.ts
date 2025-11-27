<<<<<<< HEAD
=======
// hooks/useOptimisticPagos.ts (versión más simple y segura)
>>>>>>> dev
import { useState, useCallback } from 'react';
import { PagoWithRelations } from 'lib/api/pagos';

export const useOptimisticPagos = (initialPagos: PagoWithRelations[] = []) => {
  const [pagos, setPagos] = useState<PagoWithRelations[]>(initialPagos);

  const updatePagoInState = useCallback((pagoId: number, updates: Partial<PagoWithRelations>) => {
<<<<<<< HEAD
    setPagos(prev =>
      prev.map(pago =>
=======
    setPagos(prev => 
      prev.map(pago => 
>>>>>>> dev
        pago.id_pago === pagoId ? { ...pago, ...updates } : pago
      )
    );
  }, []);

  const removePagoFromState = useCallback((pagoId: number) => {
<<<<<<< HEAD
    setPagos(prev =>
=======
    setPagos(prev => 
>>>>>>> dev
      prev.filter(pago => pago.id_pago !== pagoId)
    );
  }, []);

  const setPagosState = useCallback((newPagos: PagoWithRelations[]) => {
    setPagos(newPagos);
  }, []);

  const addPagoToState = useCallback((pago: PagoWithRelations) => {
    setPagos(prev => {
      const newPagos = [...prev, pago];
<<<<<<< HEAD
      return newPagos.sort((a, b) =>
=======
      return newPagos.sort((a, b) => 
>>>>>>> dev
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