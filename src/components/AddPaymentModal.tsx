import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';
import { AddPaymentForm } from './AddPaymentForm';

interface AddPaymentModalProps {
  onPaymentAdded?: () => void;
}

export function AddPaymentModal({ onPaymentAdded }: AddPaymentModalProps) {
  // TEMA: Usar useColorScheme, actualizar con ThemeProvider cuando esté listo
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isVisible, setIsVisible] = useState(false);

  const handleSuccess = async () => {
    setIsVisible(false);
    onPaymentAdded?.();
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setIsVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.openButtonText}>➕ Agregar Pago</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancel}
      >
        <View
          style={[
            styles.modalContainer,
            isDark && styles.modalContainerDark
          ]}
        >
          <AddPaymentForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  openButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  openButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContainerDark: {
    backgroundColor: '#0a0a0a',
  },
});