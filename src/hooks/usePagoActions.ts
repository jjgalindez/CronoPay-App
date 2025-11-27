// hooks/usePagoActions.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { PagoWithRelations, setPagoEstado, deletePago } from 'lib/api/pagos';

export const usePagoActions = (onActionSuccess?: () => void) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleMarkAsPaid = async (pago: PagoWithRelations) => {
    setLoadingAction(`paid-${pago.id_pago}`);
    
    try {
      console.log('Marcando como pagado:', pago.id_pago);
      
      // Llamada real a Supabase
      await setPagoEstado(pago.id_pago, 'Pagado');
      
      Alert.alert('Éxito', `Pago "${pago.titulo}" marcado como pagado`);
      
      // Refrescar los datos
      if (onActionSuccess) {
        onActionSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error marcando como pagado:', error);
      Alert.alert('Error', error.message || 'No se pudo marcar el pago como pagado');
      return false;
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeletePago = async (pago: PagoWithRelations) => {
    setLoadingAction(`delete-${pago.id_pago}`);
    
    try {
      // Mostrar confirmación antes de eliminar
      return new Promise<boolean>((resolve) => {
        Alert.alert(
          'Eliminar Pago',
          `¿Estás seguro de que quieres eliminar el pago "${pago.titulo}"?`,
          [
            { 
              text: 'Cancelar', 
              style: 'cancel',
              onPress: () => {
                setLoadingAction(null);
                resolve(false);
              }
            },
            { 
              text: 'Eliminar', 
              style: 'destructive',
              onPress: async () => {
                try {
                  console.log('Eliminando pago:', pago.id_pago);
                  
                  // Llamada real a Supabase
                  await deletePago(pago.id_pago);
                  
                  Alert.alert('Éxito', `Pago "${pago.titulo}" eliminado`);
                  
                  // Refrescar los datos
                  if (onActionSuccess) {
                    onActionSuccess();
                  }
                  
                  resolve(true);
                } catch (error: any) {
                  console.error('Error eliminando pago:', error);
                  Alert.alert('Error', error.message || 'No se pudo eliminar el pago');
                  resolve(false);
                } finally {
                  setLoadingAction(null);
                }
              }
            }
          ]
        );
      });
    } catch (error: any) {
      console.error('Error en confirmación de eliminación:', error);
      setLoadingAction(null);
      return false;
    }
  };

  return {
    loadingAction,
    handleMarkAsPaid,
    handleDeletePago,
  };
};