// app/(onboarding)/perfil/_layout.tsx
import { Stack } from "expo-router"

export default function PerfilLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Perfil y Configuración",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  )
}