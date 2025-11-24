// src/components/profile/ConfigurationItem.tsx
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { View, Text, Pressable, Switch, Platform } from "react-native"

type ItemKey = "notifications" | "language" | "theme" | "backup" | "security"

interface ConfigurationItemProps {
  itemKey: ItemKey
  title: string
  subtitle: string
  onPress: () => void
  hasSwitch?: boolean
  switchValue?: boolean
  onSwitchChange?: (value: boolean) => void
  isLast?: boolean
}

const ICON_MAP: Record<
  ItemKey,
  { name: keyof typeof Ionicons.glyphMap; color: string }
> = {
  notifications: { name: "notifications-outline", color: "#3B82F6" },
  language: { name: "language-outline", color: "#10B981" },
  theme: { name: "color-palette-outline", color: "#8B5CF6" },
  backup: { name: "cloud-upload-outline", color: "#F59E0B" },
  security: { name: "shield-checkmark-outline", color: "#EF4444" },
}

export const ConfigurationItem = React.memo(
  ({
    itemKey,
    title,
    subtitle,
    onPress,
    hasSwitch = false,
    switchValue = false,
    onSwitchChange,
    isLast = false,
  }: ConfigurationItemProps) => {
    const { name, color } = ICON_MAP[itemKey]

    const content = (
      <View
        className="flex-1 flex-row items-center bg-white dark:bg-black"
        style={{ columnGap: 12 }}
      >
        <View className="items-center justify-center">
          <Ionicons name={name} size={22} color={color} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-medium text-gray-900 dark:text-gray-100"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400" style={{ marginTop: 2 }} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            thumbColor={switchValue ? "#10B981" : "#f4f3f4"}
            trackColor={{ true: "#A7F3D0", false: "#E5E7EB" }}
            ios_backgroundColor="#E5E7EB"
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    )

    if (hasSwitch) {
      return (
        <View
          className={`px-6 py-4 ${!isLast ? "border-b border-gray-200 dark:border-gray-800" : ""}`}
        >
          {content}
        </View>
      )
    }

    return (
      <Pressable
        className={`px-6 py-4 ${!isLast ? "border-b border-gray-200 dark:border-gray-800" : ""}`}
        onPress={onPress}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? Platform.OS === "ios"
                ? "#F3F4F6"
                : "#F9FAFB"
              : "transparent",
          },
        ]}
        android_ripple={{ color: "#F3F4F6" }}
      >
        {content}
      </Pressable>
    )
  },
)

ConfigurationItem.displayName = "ConfigurationItem"
