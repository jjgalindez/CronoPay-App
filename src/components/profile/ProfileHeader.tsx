// src/components/profile/ProfileHeader.tsx
import React from "react"
import { View, Text, TouchableOpacity } from "react-native"

interface ProfileHeaderProps {
  name: string
  email: string
  onEditProfile: () => void
}

export function ProfileHeader({ name, email, onEditProfile }: ProfileHeaderProps) {
  return (
    <View className="px-6 py-6 border-b border-gray-200">
      <Text className="text-2xl font-bold text-gray-900 mb-2">{name}</Text>
      <Text className="text-gray-600 text-base mb-4">{email}</Text>
      
      <TouchableOpacity 
        onPress={onEditProfile}
        className="bg-gray-100 py-3 px-4 rounded-lg border border-gray-300 self-start"
      >
        <Text className="text-gray-800 font-medium text-base">Editar perfil</Text>
      </TouchableOpacity>
    </View>
  )
}