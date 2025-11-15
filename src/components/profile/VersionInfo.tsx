// src/components/profile/VersionInfo.tsx
import React from "react"
import { View, Text } from "react-native"

interface VersionInfoProps {
  version: string
}

export function VersionInfo({ version }: VersionInfoProps) {
  return (
    <View className="px-6 py-4">
      <Text className="text-gray-400 text-center text-sm">
        Versión {version}
      </Text>
    </View>
  )
}