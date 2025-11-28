import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PagoWithRelations, setPagoEstado, deletePago } from 'lib/api/pagos';

export const usePagoActions = (onActionSuccess?: () => void) => {
  const { t } = useTranslation();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleMarkAsPaid = async (pago: PagoWithRelations) => {
    setLoadingAction(`paid-${pago.id_pago}`);

    try {
      console.log('Marcando como pagado:', pago.id_pago);

      // Llamada real a Supabase
      await setPagoEstado(pago.id_pago, 'Pagado');
      
      Alert.alert(
        t('Success'), 
        `${t('PaymentColon')} "${pago.titulo}" ${t('MarkedAsPaid')}`
      );
      
      // Refrescar los datos
      if (onActionSuccess) {
        onActionSuccess();
      }

      return true;
    } catch (error: any) {
      console.error('Error marcando como pagado:', error);
      Alert.alert(
        t('Error'),
        error.message || t('CouldNotMarkAsPaid')
      );
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
          t('DeletePayment'),
          `${t('SureToDeletePayment')} "${pago.titulo}"?`,
          [
            { 
              text: t('Cancel'), 
              style: 'cancel',
              onPress: () => {
                setLoadingAction(null);
                resolve(false);
              }
            },
            { 
              text: t('DeletePayment'), 
              style: 'destructive',
              onPress: async () => {
                try {
                  console.log('Eliminando pago:', pago.id_pago);

                  // Llamada real a Supabase
                  await deletePago(pago.id_pago);
                  
                  Alert.alert(
                    t('Success'),
                    `${t('PaymentColon')} "${pago.titulo}" ${t('Deleted')}`
                  );
                  
                  // Refrescar los datos
                  if (onActionSuccess) {
                    onActionSuccess();
                  }

                  resolve(true);
                } catch (error: any) {
                  console.error('Error eliminando pago:', error);
                  Alert.alert(
                    t('Error'),
                    error.message || t('CouldNotDeletePayment')
                  );
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