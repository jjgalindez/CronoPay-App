import { PaymentCalendar } from "@/components/PaymentCalendar"
import { PaymentReminders } from "@/components/PaymentReminders"
import { ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function CalendarioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5] dark:bg-slate-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Calendario visual del mes */}
        <PaymentCalendar />

        {/* Lista de recordatorios detallados */}
        <PaymentReminders />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
})