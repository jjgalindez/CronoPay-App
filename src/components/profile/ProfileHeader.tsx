// src/components/profile/ProfileHeader.tsx
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { useTranslation } from "react-i18next"
import { View, Text, Pressable, Image, useWindowDimensions } from "react-native"
import Button from "../Button"

interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl?: string | null
  onEditProfile: () => void
}

export const ProfileHeader = React.memo(
  ({ name, email, avatarUrl, onEditProfile }: ProfileHeaderProps) => {
    const { t } = useTranslation()
    const { width } = useWindowDimensions()
    const isSmallScreen = width < 375

    const avatarSize = isSmallScreen ? 64 : 78
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
      <View className="flex-1 bg-white dark:bg-slate-900">
        <View
          className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-slate-900"
          style={{
            paddingHorizontal: Math.max(16, width * 0.05),
            paddingVertical: isSmallScreen ? 16 : 24,
          }}
        >
          <View className="mb-4 items-center" style={{ rowGap: isSmallScreen ? 8 : 12 }}>
            <View className="relative">
              {avatarUrl ? (
                <View
                  className="overflow-hidden rounded-full border-2 border-green-500 dark:border-gray-700"
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
                  className="items-center justify-center rounded-full border-2 border-gray-200 bg-green-500 dark:border-gray-700"
                  style={{ height: avatarSize, width: avatarSize }}
                >
                  <Text
                    className="font-bold text-white dark:text-gray-100"
                    style={{ fontSize: avatarSize * 0.3 }}
                  >
                    {getIniciales(name || "U")}
                  </Text>
                </View>
              )}
              <View className="absolute -bottom-1 -right-1 h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-100 dark:border-gray-800 dark:bg-gray-700">
                <Ionicons name="person" size={12} color="#6B7280" />
              </View>
            </View>

            <View className="items-center">
              <Text
                className="mb-1 font-bold text-gray-900 dark:text-gray-100"
                style={{ fontSize: titleSize }}
                numberOfLines={1}
              >
                {name}
              </Text>
              <View className="gap-1 flex-row items-center">
                <Ionicons name="mail-outline" size={14} color="#6B7280" />
                <Text
                  className="text-sm text-gray-600 dark:text-gray-400"
                  numberOfLines={1}
                >
                  {email}
                </Text>
              </View>
            </View>
          </View>

          <Button label={t("editProfile")}
          icon="pencil-outline"
          backgroundColor="#00C48C"
          darkBackgroundColor="#0B6B4F"
          size="adjust"
          onPress={onEditProfile} />
        </View>
      </View>
    )
  },
)

ProfileHeader.displayName = "ProfileHeader"
