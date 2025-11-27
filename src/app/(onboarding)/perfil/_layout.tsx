// app/(onboarding)/perfil/_layout.tsx
import Ionicons from "@expo/vector-icons/Ionicons"
import { Stack, router } from "expo-router"
import { use } from "react"
import { useTranslation } from "react-i18next"
import { TouchableOpacity, View } from "react-native"

import { useTema } from "@/hooks/useTema"

export default function PerfilLayout() {
  const { t } = useTranslation()
  const { tema } = useTema()
  const headerStyle = {
    backgroundColor: tema === "dark" ? "#0F172A" : "#FFFFFF",
  }
  const headerTintColor = tema === "dark" ? "#FFFFFF" : "#1B3D48"
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "   " + t("profilAndSettings"),
          headerShadowVisible: false,
          headerStyle,
          headerTintColor,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={headerTintColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="editar"
        options={{
          title: "   Editar Perfil",
          headerShadowVisible: false,
          headerStyle,
          headerTintColor,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={headerTintColor} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  )
}
