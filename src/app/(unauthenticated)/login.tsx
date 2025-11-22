// src/app/(unauthenticated)/login.tsx
import { router } from "expo-router"
import { View, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { EmailPasswordForm } from "../../components/auth/EmailPasswordForm"

import GoogleSign from "@/components/auth/GoogleSign"
import FooterLinks from "@/components/home/FooterLinks"

export default function LoginPage() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 justify-between px-4 py-6">
        <View
          className="flex-1 justify-center"
          style={{ maxWidth: 620, alignSelf: "center" }}
        >
          {/* Encabezado */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-neutral-900 dark:text-gray-100">
              Iniciar sesión
            </Text>
            <Text className="mt-2 text-[15px] text-neutral-600 dark:text-gray-400">
              Ingresa con tu correo y contraseña para continuar.
            </Text>
          </View>

          {/* Tarjeta de login */}
          <View className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
            <EmailPasswordForm />

            <View className="my-4 flex-row items-center">
              <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
              <Text className="mx-3 text-[13px] text-neutral-500 dark:text-gray-400">
                o continúa con
              </Text>
              <View className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            </View>

            {/* Botón de Google */}
            <GoogleSign />
          </View>

          {/* Enlace a registro */}
          <View className="mt-6 items-center">
            <Text className="text-[15px] text-neutral-700 dark:text-gray-300">
              ¿No tienes cuenta?{" "}
              <Text
                className="font-semibold"
                style={{ color: "#2791B5" }}
                onPress={() => router.push("/(unauthenticated)/sign-up")}
              >
                Regístrate
              </Text>
            </Text>
          </View>
        </View>

        {/* Footer*/}
        <View className="items-center">
          <FooterLinks />
        </View>
      </View>
    </SafeAreaView>
  )
}
