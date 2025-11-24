import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useColorScheme } from 'nativewind'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  // Use Tailwind `dark:` classes for container colors; icons need explicit color prop
  const containerClass = 'flex-row items-center justify-between px-4 bg-white dark:bg-slate-900 border-t border-t-[#F8FAFC] dark:border-t-[#111827]'
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View className={containerClass} style={{ paddingTop: 8, paddingBottom: 12 }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label =
          options.title ?? (route.name && route.name.length ? route.name : route.key)

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        // Fallback icon mapping if not provided
        let iconProp: any = null
        if (route.name === 'pagos') iconProp = 'card-outline'
        else if (route.name === 'calendario') iconProp = 'calendar-outline'
        else if (route.name === 'inicio') iconProp = 'home-outline'
        else if (route.name === 'estadisticas') iconProp = 'stats-chart-outline'
        else if (route.name === 'reportes') iconProp = 'document-text-outline'

        const lightColor = isFocused ? '#0C212C' : '#94A5AB'
        const darkColor = isFocused ? '#E6F6F2' : '#9CA3AF'

        const labelClass = isFocused
          ? 'text-[13px] font-semibold text-[#0C212C] dark:text-[#E6F6F2]'
          : 'text-[13px] font-medium text-[#94A5AB] dark:text-[#9CA3AF]'

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={(options as any).tabBarAccessibilityLabel}
            testID={(options as any).tabBarTestID}
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center"
            activeOpacity={0.8}
          >
            {/* single icon with dynamic color (vector icons don't support className reliably) */}
            <Ionicons
              name={(iconProp as any) ?? 'ellipse'}
              size={24}
              color={isDark ? darkColor : lightColor}
            />
            <Text className={labelClass}>
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
      {/* spacer for safe area bottom */}
      <View style={{ height: insets.bottom }} />
    </View>
  )
}
