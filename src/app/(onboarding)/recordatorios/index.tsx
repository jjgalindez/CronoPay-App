import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import RecordatoriosList from '../../../components/RecordatoriosList'
import useRecordatorios from '../../../hooks/useRecordatorios'


export default function RecordatoriosIndex() {
  const { data, isLoading } = useRecordatorios()

  return (
    <SafeAreaView className="flex-1 p-4 bg-white dark:bg-slate-900">
      <RecordatoriosList items={data} />
    </SafeAreaView>
  )
}