// src/components/home/FooterLinks.tsx
import { Link } from "expo-router"
import React from "react"
import { useTranslation } from "react-i18next"
import { View, Text, Pressable } from "react-native"

const FooterLinks = React.memo(() => {
  const { t } = useTranslation()
  return (
    <View className="mt-8 items-center pb-4">
      <View className="gap-6 flex-row">
        <Link href="/terms" asChild>
          <Pressable hitSlop={8}>
            <Text className="ml-3 flex-1 text-sm text-neutral-500">
              {t("home.terms")}
            </Text>
          </Pressable>
        </Link>
        <Link href="/privacy" asChild>
          <Pressable hitSlop={8}>
            <Text className="ml-3 flex-1 text-sm text-neutral-500">
              {t("home.privacy")}
            </Text>
          </Pressable>
        </Link>
        <Link href="/support" asChild>
          <Pressable hitSlop={8}>
            <Text className="ml-3 flex-1 text-sm text-neutral-500">
              {t("home.support")}
            </Text>
          </Pressable>
        </Link>
      </View>
      <Text className="mt-3 text-xs text-neutral-400">{t("home.rights")}</Text>
    </View>
  )
})

FooterLinks.displayName = "FooterLinks"

export default FooterLinks
