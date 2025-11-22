// src/components/profile/VersionInfo.tsx
import React from "react"
import { View, Text } from "react-native"

interface VersionInfoProps {
  version: string
}

export function VersionInfo({ version }: VersionInfoProps) {
  return (
    <View className="bg-white dark:bg-black px-6 py-4">
      <Text className="text-center text-sm text-gray-400">
        Versión {version}
      </Text>
    </View>
  )
}
