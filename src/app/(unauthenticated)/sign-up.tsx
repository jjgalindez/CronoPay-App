// src/app/(unauthenticated)/sign-up.tsx
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { SignUpForm } from "../../components/auth/SignUpForm"

import FooterLinks from "@/components/home/FooterLinks"

export default function SignUpPage() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <View className="flex-1 px-4 py-6">
        <View
          className="flex-1 justify-center"
          style={{ maxWidth: 620, alignSelf: "center" }}
        >
          <SignUpForm />
        </View>
        <View className="items-center">
          <FooterLinks />
        </View>
      </View>
    </SafeAreaView>
  )
}
