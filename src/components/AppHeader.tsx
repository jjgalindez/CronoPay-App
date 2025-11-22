import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"
import { Image, Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"

type IconName = React.ComponentProps<typeof Ionicons>["name"]

type AppHeaderProps = {
  icon: IconName
  title: string
  profileUri?: string
  onProfilePress?: () => void
  topInset?: number
  variant?: "default" | "home"
  userName?: string | null
  onNotificationsPress?: () => void
}

const FALLBACK_PROFILE_URI = "https://www.gravatar.com/avatar/?d=mp&s=120"

export default function AppHeader({
  icon,
  title,
  profileUri,
  onProfilePress,
  topInset = 0,
  variant = "default",
  userName,
  onNotificationsPress,
}: AppHeaderProps) {
  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress()
      return
    }

    router.push("/(onboarding)/perfil")
  }
  const { t } = useTranslation()
  if (variant === "home") {
    return (
      <View
        className="flex-row items-center justify-between rounded-3xl bg-white px-4"
        style={{ paddingTop: topInset + 12, paddingBottom: 12 }}
      >
        <Pressable
          onPress={handleProfilePress}
          style={{ flexDirection: "row", alignItems: "center" }}
          hitSlop={8}
        >
          <Image
            source={{ uri: profileUri ?? FALLBACK_PROFILE_URI }}
            style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }}
          />

          <View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#0B2E35" }}>
              {t("Hi")}, {userName ?? t("User")} 👋
            </Text>
            <Text style={{ fontSize: 13, color: "#7C8A8C", marginTop: 2 }}>
              {t("WelcomeMessage")}
            </Text>
          </View>
        </Pressable>

        <Pressable onPress={onNotificationsPress ?? (() => router.push("/notificaciones"))} hitSlop={8}>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
            <Ionicons name="notifications-outline" size={22} color="#1B3D48" />
          </View>
        </Pressable>
      </View>
    )
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
