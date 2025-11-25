// src/components/profile/LogoutButton.tsx
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { useTranslation } from "react-i18next"
import { View, Pressable, Text, Platform } from "react-native"

interface LogoutButtonProps {
  onPress: () => void
}

export const LogoutButton = React.memo(({ onPress }: LogoutButtonProps) => {
  const { t } = useTranslation()

  return (
    <View className="mt-8 px-6">
      <View className="mb-6 border-t border-gray-300 dark:border-gray-700" />
      <Pressable
        className="flex-row items-center justify-center py-4"
        onPress={onPress}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text
          className="text-base font-semibold text-red-600"
          style={{ marginLeft: 8 }}
        >
          {t("signOut")}
        </Text>
      </Pressable>
    </View>
  )
})

LogoutButton.displayName = "LogoutButton"
