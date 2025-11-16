// src/components/home/FooterLinks.tsx
import { Link } from "expo-router"
import { View, Text, Pressable } from "react-native"

export default function FooterLinks() {
  return (
    <View className="mt-10 items-center">
      <View className="flex-row gap-x-6">
        <Link href="/terms" asChild>
          <Pressable>
            <Text className="text-sm text-neutral-500">Términos</Text>
          </Pressable>
        </Link>
        <Link href="/privacy" asChild>
          <Pressable>
            <Text className="text-sm text-neutral-500">Privacidad</Text>
          </Pressable>
        </Link>
        <Link href="/support" asChild>
          <Pressable>
            <Text className="text-sm text-neutral-500">Soporte</Text>
          </Pressable>
        </Link>
      </View>
      <Text className="mt-2 text-xs text-neutral-400">
        © 2024 CronoPay. Todos los derechos reservados.
      </Text>
    </View>
  )
}
