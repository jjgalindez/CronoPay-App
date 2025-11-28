import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTema } from '@/hooks/useTema';
import { AddPaymentForm } from './AddPaymentForm';
import FloatButton from './FloatButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeAddPaymentModal } from '../utils/addPaymentModalBus';

interface AddPaymentModalProps {
  onPaymentAdded?: () => void;
}

export function AddPaymentModal({ onPaymentAdded }: AddPaymentModalProps) {
  // TEMA: Usar useColorScheme, actualizar con ThemeProvider cuando esté listo
  const { tema } = useTema();
  const isDark = tema === 'dark';

  const insets = useSafeAreaInsets()
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsub = subscribeAddPaymentModal(() => setIsVisible(true))
    return () => unsub()
  }, [])

  const handleSuccess = async () => {
    setIsVisible(false);
    onPaymentAdded?.();
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <>
      <FloatButton
              onPress={() => setIsVisible(true)}
              position="bottom-right"
              style={{ bottom: insets.bottom + 16 }}
              color='#16a34a'
            />

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
    backgroundColor: '#0f172b',
  },
});