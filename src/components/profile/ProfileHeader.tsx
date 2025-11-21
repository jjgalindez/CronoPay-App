// src/components/profile/ProfileHeader.tsx
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { View, Text, Pressable, Image, useWindowDimensions } from "react-native"

interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl?: string | null
  onEditProfile: () => void
}

export const ProfileHeader = React.memo(
  ({ name, email, avatarUrl, onEditProfile }: ProfileHeaderProps) => {
    const { width } = useWindowDimensions()
    const isSmallScreen = width < 375

    const avatarSize = isSmallScreen ? 56 : 64
    const titleSize = isSmallScreen ? 18 : 24

    const getIniciales = (nombreCompleto: string) => {
      return nombreCompleto
        .split(" ")
        .map((palabra) => palabra[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }

    return (
      <View
        className="border-b border-gray-200"
        style={{
          paddingHorizontal: Math.max(16, width * 0.05),
          paddingVertical: isSmallScreen ? 16 : 24,
        }}
      >
        <View
          className="mb-4 flex-row items-center"
          style={{ columnGap: isSmallScreen ? 12 : 16 }}
        >
          <View className="relative">
            {avatarUrl ? (
              <View
                className="overflow-hidden rounded-full border-2 border-gray-200"
                style={{ height: avatarSize, width: avatarSize }}
              >
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ height: avatarSize, width: avatarSize }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View
                className="items-center justify-center rounded-full border-2 border-gray-200 bg-green-500"
                style={{ height: avatarSize, width: avatarSize }}
              >
                <Text
                  className="font-bold text-white"
                  style={{ fontSize: avatarSize * 0.3 }}
                >
                  {getIniciales(name || "U")}
                </Text>
              </View>
            )}
            <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-100">
              <Ionicons name="person" size={12} color="#6B7280" />
            </View>
          </View>

          <View className="flex-1">
            <Text
              className="mb-1 font-bold text-gray-900"
              style={{ fontSize: titleSize }}
              numberOfLines={1}
            >
              {name}
            </Text>
            <View className="flex-row items-center" style={{ columnGap: 4 }}>
              <Ionicons name="mail-outline" size={14} color="#6B7280" />
              <Text className="flex-1 text-sm text-gray-600" numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onEditProfile}
          className="self-start rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        >
          {({ pressed }) => (
            <View className="flex-row items-center" style={{ columnGap: 6 }}>
              <Ionicons name="pencil-outline" size={16} color="#374151" />
              <Text className="text-base font-medium text-gray-800">
                Editar perfil
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    )
  },
)

ProfileHeader.displayName = "ProfileHeader"
