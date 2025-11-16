// src/components/profile/LogoutButton.tsx
import React from "react"
import { View, TouchableOpacity, Text } from "react-native"

interface LogoutButtonProps {
  onPress: () => void
}

export function LogoutButton({ onPress }: LogoutButtonProps) {
  return (
    <View className="mt-8 px-6">
      <View className="border-t border-gray-300 mb-6" />
      <TouchableOpacity 
        className="py-4 items-center"
        onPress={onPress}
      >
        <Text className="text-red-600 font-semibold text-base">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}