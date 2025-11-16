// app/(onboarding)/perfil/index.tsx
import { View, ScrollView, Alert, Text, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../../../providers/AuthProvider"
import { useUsuarioPerfil } from "../../../hooks/useUsuarioPerfil"
import { ProfileHeader } from "../../../components/profile/ProfileHeader"
import { ConfigurationList } from "../../../components/profile/ConfigurationList"
import { LogoutButton } from "../../../components/profile/LogoutButton"
import { VersionInfo } from "../../../components/profile/VersionInfo"
import { router } from "expo-router"

export default function PerfilScreen() {
  const { session, signOut } = useAuth()
  const { data: perfil, isLoading, refetch } = useUsuarioPerfil(session?.user?.id)
  const { width } = useWindowDimensions()
  const isSmallScreen = width < 375

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: signOut },
      ]
    )
  }

  const handleEditProfile = () => {
    router.push("/(onboarding)/perfil/editar")
  }

  const getDisplayName = () => {
    return perfil?.nombre || session?.user?.email?.split('@')[0] || "Usuario"
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingBottom: isSmallScreen ? 32 : 40
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={getDisplayName()}
          email={session?.user?.email || "jose@correo.com"}
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