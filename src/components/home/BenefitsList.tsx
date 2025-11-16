// src/components/home/BenefitsList.tsx
import React from "react"
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
] as const

const BenefitItem = React.memo<{ icon: string; text: string }>(({ icon, text }) => (
  <View className="flex-row items-start" style={{ columnGap: 12 }}>
    <View className="mt-0.5 w-6 items-center">
      <Icon name={icon} size={22} color="#3b82f6" />
    </View>
    <Text className="flex-1 text-[14px] leading-relaxed text-neutral-700">{text}</Text>
  </View>
))

BenefitItem.displayName = "BenefitItem"

const BenefitsList = React.memo(() => {
  return (
    <View className="my-4" style={{ rowGap: 16 }}>
      {benefits.map(({ icon, text }, index) => (
        <BenefitItem key={index} icon={icon} text={text} />
      ))}
    </View>
  )
})

BenefitsList.displayName = "BenefitsList"

export default BenefitsList
