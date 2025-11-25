// src/app/index.tsx
import { Pressable, ScrollView, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import AppPreview from "@/components/home/AppPreview"
import AuthActions from "@/components/home/AuthActions"
import BenefitsList from "@/components/home/BenefitsList"
import FooterLinks from "@/components/home/FooterLinks"
import HeroSection from "@/components/home/HeroSection"

export default function Page() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView
        className="flex-1 bg-white dark:bg-slate-900"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-between bg-white px-4 py-6 dark:bg-slate-900">
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
