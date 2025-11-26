import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Slot } from 'expo-router'
import AppHeader from '../../../components/AppHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../../../providers/AuthProvider'
import { useUsuarioPerfil } from '../../../hooks/useUsuarioPerfil'
import { TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import FloatButton from '../../../components/FloatButton'

export default function RootLayout() {
  const insets = useSafeAreaInsets()
  const { session } = useAuth()
  const userId = session?.user?.id ?? null
  const { data: perfil } = useUsuarioPerfil(userId, { enabled: !!userId })

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <AppHeader
        icon="alarm-outline"
        title="Recordatorios"
        topInset={insets.top}
        profileUri={perfil?.avatar_url}
        userName={perfil?.nombre ?? null}
      />
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: 'relative', left: 10, top: insets.top, zIndex: 10 }}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={24} color="#1B3D48" />
      </TouchableOpacity>
      <Slot />
      <FloatButton
        onPress={() => router.push('/(onboarding)/recordatorios/create-reminder')}
        position="bottom-right"
        style={{ bottom: insets.bottom + 16 }}
      />
    </SafeAreaView>
  )
}