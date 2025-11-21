// src/components/home/FooterLinks.tsx
import { Link } from "expo-router"
import React from "react"
import { View, Text, Pressable } from "react-native"

const FooterLinks = React.memo(() => {
  return (
    <View className="mt-8 items-center pb-4">
      <View className="flex-row" style={{ columnGap: 24 }}>
        <Link href="/terms" asChild>
          <Pressable hitSlop={8}>
            <Text className="text-sm text-neutral-500">Términos</Text>
          </Pressable>
        </Link>
        <Link href="/privacy" asChild>
          <Pressable hitSlop={8}>
            <Text className="text-sm text-neutral-500">Privacidad</Text>
          </Pressable>
        </Link>
        <Link href="/support" asChild>
          <Pressable hitSlop={8}>
            <Text className="text-sm text-neutral-500">Soporte</Text>
          </Pressable>
        </Link>
      </View>
      <Text className="mt-3 text-xs text-neutral-400">
        © 2024 CronoPay. Todos los derechos reservados.
      </Text>
    </View>
  )
})

FooterLinks.displayName = "FooterLinks"

export default FooterLinks
