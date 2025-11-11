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
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1B3D48',
        }}
      />
      <Stack.Screen
        name="editar"
        options={{
          title: "Editar Perfil",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1B3D48',
        }}
      />
    </Stack>
  )
}