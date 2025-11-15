// src/app/(unauthenticated)/sign-up.tsx
import { SafeAreaView } from "react-native-safe-area-context"

import { SignUpForm } from "../../components/auth/SignUpForm"

export default function SignUpPage() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <SignUpForm />
    </SafeAreaView>
  )
}
