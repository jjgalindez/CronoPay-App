// src/components/profile/LogoutButton.tsx
import React from "react"
import { View, Pressable, Text, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface LogoutButtonProps {
  onPress: () => void
}

export const LogoutButton = React.memo(({ onPress }: LogoutButtonProps) => {
  return (
    <View className="mt-8 px-6">
      <View className="border-t border-gray-300 mb-6" />
      <Pressable 
        className="py-4 items-center flex-row justify-center"
        onPress={onPress}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.6 : 1,
          }
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text 
          className="text-red-600 font-semibold text-base"
          style={{ marginLeft: 8 }}
        >
          Cerrar sesión
        </Text>
      </Pressable>
    </View>
  )
})

LogoutButton.displayName = "LogoutButton"