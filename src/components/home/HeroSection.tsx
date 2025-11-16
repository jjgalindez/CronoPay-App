// src/components/home/HeroSection.tsx
import { Text, View, Image } from "react-native"

export default function HeroSection() {
  return (
    <View className="mb-6">
      <View className="mb-2 flex-row items-center">
        <Image
          source={require("@/assets/CronoPayLogo.png")}
          style={{ width: 50, height: 50, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text className="text-[13px] font-medium text-neutral-600">
          CronoPay
        </Text>
      </View>
      <Text className="my-2 py-2 text-[24px] font-bold leading-7 text-[#0C212C]">
        Organiza tus pagos fácilmente
      </Text>
      <Text className="mt-2 text-[16px] text-neutral-600">
        Controla todas tus suscripciones y pagos recurrentes desde una sola app
      </Text>
    </View>
  )
}
