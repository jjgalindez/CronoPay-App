// src/components/profile/ConfigurationItem.tsx
import React from "react"
import { View, Text, Pressable, Switch, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ConfigurationItemProps {
  title: string
  subtitle: string
  onPress: () => void
  hasSwitch?: boolean
  switchValue?: boolean
  onSwitchChange?: (value: boolean) => void
  isLast?: boolean
}

export const ConfigurationItem = React.memo(({
  title,
  subtitle,
  onPress,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  isLast = false,
}: ConfigurationItemProps) => {

  // Función para obtener el ícono según el título
  const getIcono = () => {
    switch (title) {
      case "Notificaciones":
        return "notifications-outline"
      case "Idioma":
        return "language-outline"
      case "Tema":
        return "color-palette-outline"
      case "Copia de seguridad":
        return "cloud-upload-outline"
      case "Seguridad":
        return "shield-checkmark-outline"
      default:
        return "settings-outline"
    }
  }

  // Función para obtener el color del ícono
  const getColorIcono = () => {
    switch (title) {
      case "Notificaciones":
        return "#3B82F6" // Azul
      case "Idioma":
        return "#10B981" // Verde
      case "Tema":
        return "#8B5CF6" // Violeta
      case "Copia de seguridad":
        return "#F59E0B" // Ámbar
      case "Seguridad":
        return "#EF4444" // Rojo
      default:
        return "#6B7280" // Gris
    }
  }

  const content = (
    <View className="flex-1 flex-row items-center" style={{ columnGap: 12 }}>
      <View className="items-center justify-center">
        <Ionicons 
          name={getIcono() as any} 
          size={22} 
          color={getColorIcono()} 
        />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>{title}</Text>
        <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={2}>{subtitle}</Text>
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
        className={`px-6 py-4 ${
          !isLast ? "border-b border-gray-100" : ""
        }`}
      >
        {content}
      </View>
    )
  }

  return (
    <Pressable
      className={`px-6 py-4 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? (Platform.OS === 'ios' ? '#F3F4F6' : '#F9FAFB') : 'transparent',
        }
      ]}
      android_ripple={{ color: '#F3F4F6' }}
    >
      {content}
    </Pressable>
  )
})

ConfigurationItem.displayName = "ConfigurationItem"