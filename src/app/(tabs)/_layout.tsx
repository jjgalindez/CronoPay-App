import Ionicons from "@expo/vector-icons/Ionicons"
import { Tabs, useRouter } from "expo-router"
import { useEffect, type ComponentProps } from "react"
import { Text, useColorScheme } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuth } from "../../../providers/AuthProvider"
import AppHeader from "../../components/AppHeader"
import { useUsuarioPerfil } from "../../hooks/useUsuarioPerfil"

const ACTIVE_COLOR = "#0C212C"
const INACTIVE_COLOR = "#94A5AB"

type IconName = ComponentProps<typeof Ionicons>["name"]

const TAB_CONFIG: Record<string, { title: string; icon: IconName }> = {
  pagos: { title: "Pagos", icon: "card-outline" },
  calendario: { title: "Calendario", icon: "calendar-outline" },
  inicio: { title: "Inicio", icon: "home-outline" },
  estadisticas: { title: "Panel de Estadísticas", icon: "stats-chart-outline" },
  reportes: { title: "Reportes Mensuales", icon: "document-text-outline" },
}

function TabLabel({ focused, label, isDark }: { focused: boolean; label: string; isDark: boolean }) {
  return (
    <Text
      style={{
        color: focused ? (isDark ? '#fafafa' : ACTIVE_COLOR) : (isDark ? '#a3a3a3' : INACTIVE_COLOR),
        fontSize: 13,
        fontWeight: focused ? "600" : "500",
      }}
    >
      {label}
    </Text>
  )
}

export default function TabsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const { loading, session } = useAuth()
  const router = useRouter()
  const userId = session?.user?.id ?? null
  const { data: perfil } = useUsuarioPerfil(userId)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.replace("/(unauthenticated)/login")
    }
  }, [loading, session, router])

  if (loading || !session) {
    return null
  }

  return (
    <Tabs
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name] ?? TAB_CONFIG.inicio
        return {
          headerShown: true,
          header: () => (
            <AppHeader
              icon={config.icon}
              title={config.title}
              profileUri={perfil?.avatar_url ?? undefined}
              topInset={insets.top}
            />
          ),
          tabBarActiveTintColor: isDark ? '#fafafa' : ACTIVE_COLOR,
          tabBarInactiveTintColor: isDark ? '#a3a3a3' : INACTIVE_COLOR,
          tabBarStyle: {
            height: 70 + insets.bottom,
            paddingTop: 8,
            paddingBottom: 12 + insets.bottom,
            borderTopWidth: 0,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 6,
            backgroundColor: isDark ? "#171717" : "#FFFFFF",
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }
      }}
    >
      <Tabs.Screen
        name="pagos"
        options={{
          title: "Pagos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="card-outline" size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label="Pagos" isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label="Calendario" isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label="Inicio" isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: "Estadísticas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label="Estadísticas" isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label="Reportes" isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  )
}
