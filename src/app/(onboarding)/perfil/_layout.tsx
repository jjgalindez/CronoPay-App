// app/(onboarding)/perfil/_layout.tsx
import { Stack } from "expo-router"
import { TouchableOpacity } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"

export default function PerfilLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Perfil y Configuración",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1B3D48" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="editar"
        options={{
          title: "Editar Perfil",
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1B3D48" />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  )
}