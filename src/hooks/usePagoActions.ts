<<<<<<< HEAD
import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PagoWithRelations, setPagoEstado, deletePago } from 'lib/api/pagos';

export const usePagoActions = (onActionSuccess?: () => void) => {
  const { t } = useTranslation();
=======
// hooks/usePagoActions.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { PagoWithRelations, setPagoEstado, deletePago } from 'lib/api/pagos';

export const usePagoActions = (onActionSuccess?: () => void) => {
>>>>>>> dev
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleMarkAsPaid = async (pago: PagoWithRelations) => {
    setLoadingAction(`paid-${pago.id_pago}`);
    
    try {
      console.log('Marcando como pagado:', pago.id_pago);
      
      // Llamada real a Supabase
      await setPagoEstado(pago.id_pago, 'Pagado');
      
<<<<<<< HEAD
      Alert.alert(
        t('Success'), 
        `${t('PaymentColon')} "${pago.titulo}" ${t('MarkedAsPaid')}`
      );
=======
      Alert.alert('Éxito', `Pago "${pago.titulo}" marcado como pagado`);
>>>>>>> dev
      
      // Refrescar los datos
      if (onActionSuccess) {
        onActionSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error marcando como pagado:', error);
<<<<<<< HEAD
      Alert.alert(
        t('Error'), 
        error.message || t('CouldNotMarkAsPaid')
      );
=======
      Alert.alert('Error', error.message || 'No se pudo marcar el pago como pagado');
>>>>>>> dev
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
<<<<<<< HEAD
          t('DeletePayment'),
          `${t('SureToDeletePayment')} "${pago.titulo}"?`,
          [
            { 
              text: t('Cancel'), 
=======
          'Eliminar Pago',
          `¿Estás seguro de que quieres eliminar el pago "${pago.titulo}"?`,
          [
            { 
              text: 'Cancelar', 
>>>>>>> dev
              style: 'cancel',
              onPress: () => {
                setLoadingAction(null);
                resolve(false);
              }
            },
            { 
<<<<<<< HEAD
              text: t('DeletePayment'), 
=======
              text: 'Eliminar', 
>>>>>>> dev
              style: 'destructive',
              onPress: async () => {
                try {
                  console.log('Eliminando pago:', pago.id_pago);
                  
                  // Llamada real a Supabase
                  await deletePago(pago.id_pago);
                  
<<<<<<< HEAD
                  Alert.alert(
                    t('Success'), 
                    `${t('PaymentColon')} "${pago.titulo}" ${t('Deleted')}`
                  );
=======
                  Alert.alert('Éxito', `Pago "${pago.titulo}" eliminado`);
>>>>>>> dev
                  
                  // Refrescar los datos
                  if (onActionSuccess) {
                    onActionSuccess();
                  }
                  
                  resolve(true);
                } catch (error: any) {
                  console.error('Error eliminando pago:', error);
<<<<<<< HEAD
                  Alert.alert(
                    t('Error'), 
                    error.message || t('CouldNotDeletePayment')
                  );
=======
                  Alert.alert('Error', error.message || 'No se pudo eliminar el pago');
>>>>>>> dev
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