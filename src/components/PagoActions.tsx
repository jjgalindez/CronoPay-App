// components/PagoActions.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '@/hooks/useTema';
import { PagoWithRelations } from 'lib/api/pagos';

interface PagoActionsProps {
  pago: PagoWithRelations;
  onMarkAsPaid: (pago: PagoWithRelations) => Promise<boolean>;
  onDelete: (pago: PagoWithRelations) => Promise<boolean>;
  loadingAction: string | null;
}

export const PagoActions: React.FC<PagoActionsProps> = ({
  pago,
  onMarkAsPaid,
  onDelete,
  loadingAction,
}) => {
  const { tema } = useTema();
  const isDark = tema === 'dark';

  const isPaid = pago.estado === 'Pagado';
  const isMarkingAsPaid = loadingAction === `paid-${pago.id_pago}`;
  const isDeleting = loadingAction === `delete-${pago.id_pago}`;

  return (
    <View style={styles.actionsContainer}>
      {/* Botón Marcar como Pagado - Solo visible si no está pagado */}
      {!isPaid && (
        <TouchableOpacity
          style={[
            styles.actionButton,
            isDark ? styles.actionButtonDark : styles.actionButtonLight,
            styles.paidButton,
          ]}
          onPress={() => onMarkAsPaid(pago)}
          disabled={isMarkingAsPaid || isDeleting}
        >
          {isMarkingAsPaid ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : (
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color="#16a34a" 
            />
          )}
        </TouchableOpacity>
      )}

      {/* Botón Eliminar */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isDark ? styles.actionButtonDark : styles.actionButtonLight,
          styles.deleteButton,
        ]}
        onPress={() => onDelete(pago)}
        disabled={isMarkingAsPaid || isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#ef4444" />
        ) : (
          <Ionicons 
            name="trash" 
            size={18} 
            color="#ef4444" 
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
  },
  actionButtonDark: {
    backgroundColor: '#262626',
    borderColor: '#404040',
  },
  paidButton: {
    borderColor: '#16a34a',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
});