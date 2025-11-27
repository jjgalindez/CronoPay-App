import Ionicons from "@expo/vector-icons/Ionicons"
import type { ComponentProps } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { useTema } from "@/hooks/useTema"
import { withDecay } from "react-native-reanimated"

type ButtonProps = {
  label: string
  onPress?: () => void
  icon?: ComponentProps<typeof Ionicons>["name"]
  iconColor?: string
  backgroundColor?: string
  textColor?: string
  // Dark theme overrides: if provided and the app is in dark theme, these values
  // will be used instead of `backgroundColor`, `textColor` and `iconColor`.
  darkBackgroundColor?: string
  darkTextColor?: string
  darkIconColor?: string
  size?: "small" | "medium" | "large" | "adjust"
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  safeArea?: boolean // añade marginBottom igual al inset inferior
}

const DEFAULT_BG_COLOR = "#1B3D48"
const DEFAULT_TEXT_COLOR = "#FFFFFF"

const SIZE_STYLES = {
  small: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: 14,
    iconSize: 18,
    width: 200,
  },
  medium: {
    height: 52,
    paddingHorizontal: 20,
    fontSize: 15,
    iconSize: 20,
    width: 250,
  },
  large: {
    height: 60,
    paddingHorizontal: 24,
    fontSize: 16,
    iconSize: 22,
    width: 300,
  },
  adjust: {
    height: 50,
    fontSize: 16,
    iconSize: 22,
    paddingHorizontal: 0,
    width: 180,
  },
}

export default function Button({
  label,
  onPress,
  icon,
  iconColor,
  backgroundColor = DEFAULT_BG_COLOR,
  textColor = DEFAULT_TEXT_COLOR,
  darkBackgroundColor,
  darkTextColor,
  darkIconColor,
  size = "medium",
  disabled = false,
  style,
  safeArea = false,
}: ButtonProps) {
  const insets = useSafeAreaInsets()
  const sizeConfig = SIZE_STYLES[size]
  const { tema } = useTema()
  const isDark = tema === "dark"
  
  const effectiveBackgroundColor = disabled
    ? "#D1D5DB"
    : (isDark ? (darkBackgroundColor ?? backgroundColor) : (backgroundColor))

  const effectiveTextColor = disabled
    ? "#9CA3AF"
    : (isDark ? (darkTextColor ?? textColor) : textColor)

  const effectiveIconColor = disabled
    ? "#9CA3AF"
    : (isDark ? (darkIconColor ?? (iconColor ?? textColor)) : (iconColor ?? textColor))

  const containerStyles = [
    styles.container,
    {
      backgroundColor: effectiveBackgroundColor,
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      width: sizeConfig.width,
    },
    style,
    safeArea ? { marginBottom: insets.bottom ?? 0 } : undefined,
  ]

  const textStyles = [
    styles.text,
    {
      color: effectiveTextColor,
      fontSize: sizeConfig.fontSize,
    },
  ]

  const resolvedIconColor = effectiveIconColor

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        containerStyles,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={sizeConfig.iconSize}
          color={resolvedIconColor}
          style={styles.icon}
        />
      )}
      <Text style={textStyles}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontWeight: "700",
  },
  icon: {
    marginRight: 8,
  },
})
