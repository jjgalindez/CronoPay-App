// src/components/profile/ProfileHeader.tsx
import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl?: string | null
  onEditProfile: () => void
}

export const ProfileHeader = React.memo(({ name, email, avatarUrl, onEditProfile }: ProfileHeaderProps) => {
  
  const getIniciales = (nombreCompleto: string) => {
    return nombreCompleto
      .split(' ')
      .map(palabra => palabra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <View className="border-b border-gray-200 px-6 py-6">
      <View className="mb-4 flex-row items-center" style={{ columnGap: 16 }}>
        <View className="relative">
          {avatarUrl ? (
            <View className="h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200">
              <Image
                source={{ uri: avatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-green-500">
              <Text className="text-lg font-bold text-white">
                {getIniciales(name || "U")}
              </Text>
            </View>
          )}
          <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-gray-100 border border-white">
            <Ionicons name="person" size={12} color="#6B7280" />
          </View>
        </View>
        
        <View className="flex-1">
          <Text className="mb-1 text-2xl font-bold text-gray-900" numberOfLines={1}>{name}</Text>
          <View className="flex-row items-center" style={{ columnGap: 4 }}>
            <Ionicons name="mail-outline" size={14} color="#6B7280" />
            <Text className="flex-1 text-sm text-gray-600" numberOfLines={1}>{email}</Text>
          </View>
        </View>
      </View>
      
      <Pressable 
        onPress={onEditProfile}
        className="self-start rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 }
        ]}
      >
        {({ pressed }) => (
          <View className="flex-row items-center" style={{ columnGap: 6 }}>
            <Ionicons name="pencil-outline" size={16} color="#374151" />
            <Text className="text-base font-medium text-gray-800">Editar perfil</Text>
          </View>
        )}
      </Pressable>
    </View>
  )
})

ProfileHeader.displayName = "ProfileHeader"