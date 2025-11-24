import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RecordatorioForm from '../../../components/RecordatorioForm'

export default function CreateReminderScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <View className="flex-1 p-4">
        <RecordatorioForm />
      </View>
    </SafeAreaView>
  )
}
