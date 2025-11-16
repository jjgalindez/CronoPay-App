import Ionicons from "@expo/vector-icons/Ionicons"
import type { ComponentProps } from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native"

type ButtonProps = {
  label: string
  onPress?: () => void
  icon?: ComponentProps<typeof Ionicons>["name"]
  iconColor?: string
  backgroundColor?: string
  textColor?: string
  size?: "small" | "medium" | "large"
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

const DEFAULT_BG_COLOR = "#1B3D48"
const DEFAULT_TEXT_COLOR = "#FFFFFF"

const SIZE_STYLES = {
  small: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: 14,
    iconSize: 18,
  },
  medium: {
    height: 52,
    paddingHorizontal: 20,
    fontSize: 15,
    iconSize: 20,
  },
  large: {
    height: 60,
    paddingHorizontal: 24,
    fontSize: 16,
    iconSize: 22,
  },
}

export default function Button({
  label,
  onPress,
  icon,
  iconColor,
  backgroundColor = DEFAULT_BG_COLOR,
  textColor = DEFAULT_TEXT_COLOR,
  size = "medium",
  disabled = false,
  style,
}: ButtonProps) {
  const sizeConfig = SIZE_STYLES[size]
  
  const containerStyles = [
    styles.container,
    {
      backgroundColor: disabled ? "#D1D5DB" : backgroundColor,
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
    },
    style,
  ]

  const textStyles = [
    styles.text,
    {
      color: disabled ? "#9CA3AF" : textColor,
      fontSize: sizeConfig.fontSize,
    },
  ]

  const resolvedIconColor = disabled ? "#9CA3AF" : (iconColor ?? textColor)

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
