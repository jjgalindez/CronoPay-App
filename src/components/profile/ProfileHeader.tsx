// src/components/profile/ProfileHeader.tsx
import React from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"

interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl?: string | null
  onEditProfile: () => void
}

export function ProfileHeader({ name, email, avatarUrl, onEditProfile }: ProfileHeaderProps) {
  
  const getIniciales = (nombreCompleto: string) => {
    return nombreCompleto
      .split(' ')
      .map(palabra => palabra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <View className="px-6 py-6 border-b border-gray-200">
      <View className="flex-row items-center mb-4">
        {avatarUrl ? (
          <View className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 mr-4">
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View className="w-16 h-16 rounded-full bg-green-500 items-center justify-center border-2 border-gray-200 mr-4">
            <Text className="text-white text-lg font-bold">
              {getIniciales(name || "U")}
            </Text>
          </View>
        )}
        
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900 mb-1">{name}</Text>
          <Text className="text-gray-600 text-base">{email}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        onPress={onEditProfile}
        className="bg-gray-100 py-3 px-4 rounded-lg border border-gray-300 self-start"
      >
        <Text className="text-gray-800 font-medium text-base">Editar perfil</Text>
      </TouchableOpacity>
    </View>
  )
}