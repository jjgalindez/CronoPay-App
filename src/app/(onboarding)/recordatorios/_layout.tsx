import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Modal, View } from 'react-native'
import { Slot } from 'expo-router'
import AppHeader from '../../../components/AppHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../../../providers/AuthProvider'
import { useUsuarioPerfil } from '../../../hooks/useUsuarioPerfil'
import { TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import FloatButton from '../../../components/FloatButton'
import RecordatorioForm from '../../../components/RecordatorioForm'

export default function RootLayout() {
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const { session } = useAuth()
  const userId = session?.user?.id ?? null
  const { data: perfil } = useUsuarioPerfil(userId, { enabled: !!userId })
  const [showCreate, setShowCreate] = useState(false)

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <AppHeader
        icon="alarm-outline"
        title={t('PaymentReminders')}
        profileUri={perfil?.avatar_url}
        userName={perfil?.nombre ?? null}
      />
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: 'relative', left: 10, top: 10, zIndex: 10 }}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={24} color="#1B3D48" />
      </TouchableOpacity>
      <Slot />

      <Modal
        visible={showCreate}
        animationType="slide"
        onRequestClose={() => setShowCreate(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
          <View style={{ position: 'absolute', right: 12, top: insets.top + 8, zIndex: 30 }}>
            <TouchableOpacity
              onPress={() => setShowCreate(false)}
              hitSlop={8}
              style={{ paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Ionicons name="close" size={22} color="#1B3D48" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, padding: 16 }}>
            <RecordatorioForm onSaved={() => setShowCreate(false)} />
          </View>
        </SafeAreaView>
      </Modal>

      <FloatButton
        onPress={() => setShowCreate(true)}
        position="bottom-right"
        style={{ bottom: insets.bottom + 16 }}
        color='#12C48B'
      />
    </SafeAreaView>
  )
}