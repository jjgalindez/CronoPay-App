// src/app/(unauthenticated)/login.tsx
import { router } from "expo-router"
import { View, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { EmailPasswordForm } from "../../components/auth/EmailPasswordForm"

import GoogleSign from "@/components/auth/GoogleSign"

export default function LoginPage() {
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Iniciar sesión
        </Text>
        <EmailPasswordForm />
        <View style={{ height: 12 }} />
        <GoogleSign />
        <Text style={{ marginTop: 16, textAlign: "center" }}>
          ¿No tienes cuenta?{" "}
          <Text
            style={{ color: "#2791B5" }}
            onPress={() => router.push("/(unauthenticated)/sign-up")}
          >
            Regístrate
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  )
}
