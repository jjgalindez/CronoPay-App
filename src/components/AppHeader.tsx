import Ionicons from "@expo/vector-icons/Ionicons"
import { router } from "expo-router"
import { Image, Pressable, Text, View } from "react-native"
import { useColorScheme } from "nativewind"
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
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  if (variant === "home") {
    return (
      <View style={{ paddingTop: topInset + 12 }} className="pb-3 flex-row items-center justify-between px-4 bg-white dark:bg-slate-900">
        <Pressable
          onPress={handleProfilePress}
          style={{ flexDirection: "row", alignItems: "center" }}
          hitSlop={8}
        >
          <Image
            source={{ uri: profileUri ?? FALLBACK_PROFILE_URI }}
            className="w-14 h-14 rounded-full mr-3 border border-neutral-200 dark:border-neutral-700"
          />

          <View>
            <Text className="text-[20px] font-extrabold text-primary-700 dark:text-neutral-50">
              {t("Hi")}, {userName ?? t("User")} 👋
            </Text>
            <Text className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-0.5">{t("WelcomeMessage")}</Text>
          </View>
        </Pressable>

        <Pressable onPress={onNotificationsPress ?? (() => router.push("/notificaciones"))} hitSlop={8}>
          <View className="h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-[#082027]">
            <Ionicons name="notifications-outline" size={22} color={isDark ? '#E5E7EB' : '#065F46'} />
          </View>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={{ paddingTop: topInset + 12 }} className="pb-3 flex-row items-center justify-between px-4 bg-white dark:bg-slate-900">
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 dark:bg-[#082027]">
        <Ionicons name={icon} size={24} color={isDark ? '#E5E7EB' : '#1B3D48'} />
      </View>

      <Text className="text-[18px] font-semibold text-primary-700 dark:text-neutral-50">{title}</Text>

      <Pressable onPress={handleProfilePress} hitSlop={8}>
        <Image
          source={{ uri: profileUri ?? FALLBACK_PROFILE_URI }}
          className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700"
        />
      </Pressable>
    </View>
  )
}
