import Ionicons from "@expo/vector-icons/Ionicons"
import { Tabs, useRouter } from "expo-router"
import { useEffect, type ComponentProps } from "react"
import { Text } from "react-native"
import { useColorScheme } from 'nativewind'
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "../../../providers/AuthProvider"
import AppHeader from "../../components/AppHeader"
import { useUsuarioPerfil } from "../../hooks/useUsuarioPerfil"
import { useTranslation } from "react-i18next"
const ACTIVE_COLOR = "#0C212C"
const INACTIVE_COLOR = "#94A5AB"

type IconName = ComponentProps<typeof Ionicons>["name"]

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
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { t } = useTranslation()
  const { loading, session } = useAuth()
  const router = useRouter()
  const userId = session?.user?.id ?? null
  const { data: perfil } = useUsuarioPerfil(userId)
  const insets = useSafeAreaInsets()


  const TAB_CONFIG: Record<string, { title: string; icon: IconName }> = {
    pagos: { title: t("PaymentsTitle"), icon: "card-outline" },
    calendario: { title: t("CalendarTitle"), icon: "calendar-outline" },
    inicio: { title: t("HomeTitle"), icon: "home-outline" },
    estadisticas: { title: t("StatisticsTitle"), icon: "stats-chart-outline" },
    reportes: { title: t("ReportsTitle"), icon: "document-text-outline" },
  }

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
              variant={route.name === 'inicio' ? 'home' : 'default'}
              userName={perfil?.nombre ?? null}
              onNotificationsPress={() => router.push('/(onboarding)/recordatorios')}
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
            backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
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
          title: t('PaymentsTitle'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "card" : "card-outline"} size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={t("PaymentTab")} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendario"
        options={{
          title: "Calendario",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={t("CalendarTab")} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={t("HomeTab")} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: "Estadísticas",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={t("StatisticsTab")} isDark={isDark} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          title: "Reportes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={24} color={color} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel focused={focused} label={t("ReportsTab")} isDark={isDark} />
          ),
        }}
      />
    </Tabs>
  )
}
