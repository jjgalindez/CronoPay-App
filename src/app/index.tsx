// src/app/index.tsx
import { ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import AppPreview from "@/components/home/AppPreview"
import AuthActions from "@/components/home/AuthActions"
import BenefitsList from "@/components/home/BenefitsList"
import FooterLinks from "@/components/home/FooterLinks"
import HeroSection from "@/components/home/HeroSection"

export default function Page() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-between px-4 py-6">
          <HeroSection />
          <AppPreview />
          <AuthActions />
          <BenefitsList />
          <FooterLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
