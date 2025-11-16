// src/components/home/HeroSection.tsx
import React from "react"
import { Text, View } from "react-native"

const HeroSection = React.memo(() => {
  return (
    <View className="mb-4">
      <Text className="text-[13px] font-medium text-neutral-600">CronoPay</Text>
      <Text className="mt-2 text-[28px] font-bold leading-tight text-[#0C212C]">
        Organiza tus pagos fácilmente
      </Text>
      <Text className="mt-3 text-[15px] leading-relaxed text-neutral-600">
        Controla todas tus suscripciones y pagos recurrentes desde una sola app
      </Text>
    </View>
  )
})

HeroSection.displayName = "HeroSection"

export default HeroSection
