// src/components/home/BenefitsList.tsx
import { View, Text } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const benefits = [
  {
    icon: "notifications-active",
    text: "Recordatorios automáticos: Nunca olvides un pago importante",
  },
  {
    icon: "category",
    text: "Visualiza por categoría: Organiza tus gastos de forma inteligente",
  },
  {
    icon: "bar-chart",
    text: "Reportes mensuales: Analiza tus patrones de gasto",
  },
]

export default function BenefitsList() {
  return (
    <View className="mt-8 space-y-4">
      {benefits.map(({ icon, text }, index) => (
        <View key={index} className="flex-row items-center gap-x-3 space-x-2">
          <View className="w-6 items-center">
            <Icon name={icon} size={24} color="#3b82f6" />
          </View>
          <Text className="flex-1 text-[15px] text-neutral-700">{text}</Text>
        </View>
      ))}
    </View>
  )
}
