import { PaymentCalendar } from "@/components/PaymentCalendar"
import { RefreshControl } from "react-native"
import { ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState, useCallback } from "react"

export default function CalendarioScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Key para forzar re-render

  // Función para forzar la actualización del calendario
  const refetch = useCallback(() => {
    setIsLoading(true)
    // Forzar re-render del PaymentCalendar
    setRefreshKey(prev => prev + 1) 
    // Simular carga
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5] dark:bg-slate-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
          />
        }
      >
        {/* Pasa la key para forzar re-render */}
        <PaymentCalendar key={refreshKey} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
})