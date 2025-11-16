// src/components/profile/ConfigurationItem.tsx
import React from "react"
import { View, Text, TouchableOpacity, Switch } from "react-native"

interface ConfigurationItemProps {
  title: string
  subtitle: string
  onPress: () => void
  hasSwitch?: boolean
  switchValue?: boolean
  onSwitchChange?: (value: boolean) => void
  isLast?: boolean
}

export function ConfigurationItem({
  title,
  subtitle,
  onPress,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  isLast = false,
}: ConfigurationItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row justify-between items-center px-6 py-4 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
      onPress={onPress}
      disabled={hasSwitch} // Deshabilitar el press si tiene switch
    >
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-base">{title}</Text>
        <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
      </View>
      
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          thumbColor={switchValue ? "#10B981" : "#f4f3f4"}
          trackColor={{ true: "#A7F3D0", false: "#E5E7EB" }}
        />
      ) : (
        <Text className="text-gray-400">›</Text>
      )}
    </TouchableOpacity>
  )
}