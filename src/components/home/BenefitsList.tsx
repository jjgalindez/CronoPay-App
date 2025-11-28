// src/components/home/BenefitsList.tsx
import React from "react"
import { useTranslation } from "react-i18next"
import { View, Text } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

const BenefitsList = React.memo(() => {
  const { t } = useTranslation()

  const benefits = [
    {
      icon: "notifications-active",
      text: t("home.reminders"),
    },
    {
      icon: "category",
      text: t("home.categories"),
    },
    {
      icon: "bar-chart",
      text: t("home.reports"),
    },
  ] as const

  return (
    <View className="gap-x-6 w-full">
      {benefits.map(({ icon, text }, index) => (
        <BenefitItem key={index} icon={icon} text={text} />
      ))}
    </View>
  )
})

const BenefitItem = React.memo<{ icon: string; text: string }>(
  ({ icon, text }) => (
    <View className="flex-row items-start">
      <View className="mt-0.5 w-6 items-center">
        <Icon name={icon} size={22} color="#3b82f6" />
      </View>
      <Text className="ml-3 flex-1 text-[14px] leading-relaxed text-neutral-700">
        {text}
      </Text>
    </View>
  ),
)

BenefitItem.displayName = "BenefitItem"

BenefitsList.displayName = "BenefitsList"

export default BenefitsList
