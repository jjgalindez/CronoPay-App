import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"
import { Image, Pressable, Text, View } from "react-native"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

type AppHeaderProps = {
  icon: IconName
  title: string
  profileUri?: string
  onProfilePress?: () => void
  topInset?: number
}

const FALLBACK_PROFILE_URI = "https://www.gravatar.com/avatar/?d=mp&s=120"

export default function AppHeader({
  icon,
  title,
  profileUri,
  onProfilePress,
  topInset = 0,
}: AppHeaderProps) {
  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress()
      return
    }

    router.push("/(onboarding)/perfil")
  }

  return (
    <View
      className="flex-row items-center justify-between rounded-3xl bg-white dark:bg-neutral-900 px-4"
      style={{ paddingTop: topInset + 12, paddingBottom: 12 }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
        <Ionicons name={icon} size={24} color="#1B3D48" />
      </View>

      <Text className="text-lg font-semibold text-primary-900">{title}</Text>

      <Pressable onPress={handleProfilePress} hitSlop={8}>
        <Image
          source={{ uri: profileUri ?? FALLBACK_PROFILE_URI }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      </Pressable>
    </View>
  )
}
