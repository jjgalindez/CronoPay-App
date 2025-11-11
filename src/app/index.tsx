// src/components/profile/ProfileHeader.tsx
import React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"

interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl?: string | null  // <- Nueva prop opcional
  onEditProfile: () => void
}

export function ProfileHeader({ name, email, avatarUrl, onEditProfile }: ProfileHeaderProps) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <View className="items-center mt-6">
      <View className="relative">
        {avatarUrl ? (
          // Si hay avatarUrl, mostrar la imagen
          <Image
            source={{ uri: avatarUrl }}
            className="w-28 h-28 rounded-full border-4 border-green-400"
          />
        ) : (
          // Si no hay avatarUrl, mostrar las iniciales
          <View className="w-28 h-28 rounded-full bg-green-500 items-center justify-center border-4 border-green-400">
            <Text className="text-white text-2xl font-bold">
              {getInitials(name)}
            </Text>
          </View>
        )}
        <View className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full">
          <Ionicons name="lock-closed" size={16} color="white" />
        </View>
      </View>

      <Text className="mt-3 text-lg font-semibold text-neutral-900">
        {name}
      </Text>
      <Text className="text-neutral-500">{email}</Text>

      <TouchableOpacity 
        className="mt-4 bg-green-500 px-6 py-2 rounded-md"
        onPress={onEditProfile}
      >
        <Text className="text-white font-semibold">Editar perfil</Text>
      </TouchableOpacity>
    </View>
  )
}