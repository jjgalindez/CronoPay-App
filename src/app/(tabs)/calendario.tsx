<<<<<<< HEAD
import { PaymentCalendar } from "@/components/PaymentCalendar"
import { PaymentReminders } from "@/components/PaymentReminders"
import { ScrollView, View, Text } from "react-native"

import { SafeAreaView } from "react-native-safe-area-context"


export default function CalendarioScreen() {
  
  
  return (
<<<<<<< HEAD
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
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