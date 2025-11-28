// app/(onboarding)/perfil/index.tsx
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import {
  View,
  ScrollView,
  Alert,
  Text,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useAuth } from "../../../../providers/AuthProvider"
import { ConfigurationList } from "../../../components/profile/ConfigurationList"
import { LogoutButton } from "../../../components/profile/LogoutButton"
import { ProfileHeader } from "../../../components/profile/ProfileHeader"
import { VersionInfo } from "../../../components/profile/VersionInfo"
import { useUsuarioPerfil } from "../../../hooks/useUsuarioPerfil"

export default function PerfilScreen() {
  const { session, signOut } = useAuth()
  const {
    data: perfil,
    isLoading,
    refetch,
  } = useUsuarioPerfil(session?.user?.id)
  const { width } = useWindowDimensions()
  const isSmallScreen = width < 375

  const { t } = useTranslation()

  const handleLogout = () => {
    Alert.alert(t("signOut"), t("AreYouSureYouWantToLogOut"), [
      { text: t("Cancel"), style: "cancel" },
      { text: t("signOut"), style: "destructive", onPress: signOut },
    ])
  }

  const handleEditProfile = () => {
    router.push("/(onboarding)/perfil/editar")
  }

  const getDisplayName = () => {
    return perfil?.nombre || session?.user?.email?.split("@")[0] || "Usuario"
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text>{t('LoadingProfile')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1 bg-white dark:bg-gray-900"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: isSmallScreen ? 32 : 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={getDisplayName()}
          email={session?.user?.email || t('UnknownEmail')}
          avatarUrl={perfil?.avatar_url}
          onEditProfile={handleEditProfile}
        />

        <ConfigurationList />

        <LogoutButton onPress={handleLogout} />
        <VersionInfo version="1.0.0" />
      </ScrollView>
    </SafeAreaView>
  )
}
