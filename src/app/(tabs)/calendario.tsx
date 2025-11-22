import { PaymentCalendar } from "@/components/PaymentCalendar"
import { PaymentReminders } from "@/components/PaymentReminders"
import { ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"


export default function CalendarioScreen() {


  return (
    <SafeAreaView className="flex-1 bg-[#f5f5f5] dark:bg-black">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >

        {/* Calendario visual del mes */}
        <PaymentCalendar />

        {/* Lista de recordatorios detallados */}
        <PaymentReminders />
      </ScrollView>
    </SafeAreaView>
  )
}