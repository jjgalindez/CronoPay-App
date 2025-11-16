// src/components/profile/ConfigurationItem.tsx
import React from "react"
import { View, Text, TouchableOpacity, Switch } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

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

  return (
    <TouchableOpacity
      className={`flex-row justify-between items-center px-6 py-4 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons 
          name={getIcono() as any} 
          size={22} 
          color={getColorIcono()} 
          style={{ marginRight: 12 }}
        />
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-base">{title}</Text>
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        </View>
      </View>
      
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          thumbColor={switchValue ? "#10B981" : "#f4f3f4"}
          trackColor={{ true: "#A7F3D0", false: "#E5E7EB" }}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  )
}