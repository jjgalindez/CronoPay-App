// src/components/home/HeroSection.tsx
import React from "react"
import { useTranslation } from "react-i18next"
import { Text, View } from "react-native"

const HeroSection = React.memo(() => {
  const { t } = useTranslation()
  return (
    <View className="mb-4">
      <Text className="text-[13px] font-medium text-neutral-600 dark:text-neutral-300">
        CronoPay
      </Text>
      <Text className="mt-2 text-[28px] font-bold leading-tight text-[#0C212C] dark:text-neutral-100">
        {t("home.title")}
      </Text>
      <Text className="mt-3 text-[15px] leading-relaxed text-neutral-600">
        {t("home.subtitle")}
      </Text>
    </View>
  )
})

HeroSection.displayName = "HeroSection"

export default HeroSection
