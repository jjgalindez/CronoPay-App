import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { PaymentCalendar } from "@/components/PaymentCalendar"

export default function CalendarioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View style={{ flex: 1 }}>
        <PaymentCalendar />
      </View>
    </SafeAreaView>
  )
}
