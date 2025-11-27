import Ionicons from "@expo/vector-icons/Ionicons"
import type { ReactNode, ComponentProps } from "react"
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
    type StyleProp,
    type ViewStyle,
} from "react-native"

type BoxProps = {
    icon?: ReactNode
    iconName?: ComponentProps<typeof Ionicons>["name"]
    iconColor?: string
    iconBackgroundColor?: string
    title: string
    value: string | number
    valueColor?: string
    compact?: boolean
    onPress?: () => void
    backgroundColor?: string
    style?: StyleProp<ViewStyle>
    // Progress bar props
    showProgress?: boolean
    currentAmount?: number
    totalAmount?: number
    progressColor?: string
    progressBackgroundColor?: string
    // Comparison props
    showComparison?: boolean
    comparisonText?: string
    comparisonPercentage?: number
    comparisonColor?: string
}

const DEFAULT_VALUE_COLOR = "#1B3D48"
const DEFAULT_ICON_COLOR = "#1B3D48"
const DEFAULT_ICON_BG = "#E5F1F5"
const DEFAULT_CARD_BG = "#FFFFFF"

// dark-mode fallback colors (used only when caller didn't override)
const DARK_VALUE_COLOR = "#FFFFFF"
const DARK_ICON_COLOR = "#FFFFFF"
const DARK_ICON_BG = "#1F2933"
const DARK_CARD_BG = "#171717"
const DARK_TITLE_MUTED = "#D1D5DB"

export default function Box({
    icon,
    iconName,
    iconColor = DEFAULT_ICON_COLOR,
    iconBackgroundColor = DEFAULT_ICON_BG,
    title,
    value,
    valueColor = DEFAULT_VALUE_COLOR,
    compact = false,
    onPress,
    backgroundColor = DEFAULT_CARD_BG,
    style,
    showProgress = false,
    currentAmount = 0,
    totalAmount = 100,
    progressColor = "#12C48B",
    progressBackgroundColor = "#E5E7EB",
    showComparison = false,
    comparisonText,
    comparisonPercentage,
    comparisonColor = "#12C48B",
}: BoxProps) {
    const colorScheme = useColorScheme()
    const isDark = colorScheme === "dark"

    // resolve colors but preserve any explicit prop provided by caller
    const effectiveBackground = backgroundColor === DEFAULT_CARD_BG && isDark ? DARK_CARD_BG : backgroundColor
    const effectiveIconBg = iconBackgroundColor === DEFAULT_ICON_BG && isDark ? DARK_ICON_BG : iconBackgroundColor
    const effectiveIconColor = iconColor === DEFAULT_ICON_COLOR && isDark ? DARK_ICON_COLOR : iconColor
    const effectiveValueColor = valueColor === DEFAULT_VALUE_COLOR && isDark ? DARK_VALUE_COLOR : valueColor
    const effectiveTitleColor = isDark ? DARK_TITLE_MUTED : undefined
    const containerStyles = [
        styles.container,
        compact ? styles.containerCompact : styles.containerRegular,
        { backgroundColor: effectiveBackground },
        style,
    ]

    const iconWrapperStyles = [
        compact ? styles.iconCompact : styles.iconRegular,
        { backgroundColor: effectiveIconBg },
    ]

    const resolvedIcon =
        icon ?? (
            <Ionicons
                name={iconName ?? "stats-chart-outline"}
                size={compact ? 22 : 26}
                color={effectiveIconColor}
            />
        )

    const progressPercentage = totalAmount > 0 ? (currentAmount / totalAmount) * 100 : 0
    const clampedProgress = Math.min(Math.max(progressPercentage, 0), 100)

    const body = (
        <View style={containerStyles}>
            <View style={iconWrapperStyles}>
                {resolvedIcon}
            </View>
            <View style={styles.textWrapper}>
                <Text style={[compact ? styles.titleCompact : styles.titleRegular, effectiveTitleColor ? { color: effectiveTitleColor } : {}]}>
                    {title}
                </Text>
                <Text
                    style={[
                        compact ? styles.valueCompact : styles.valueRegular,
                        { color: effectiveValueColor },
                    ]}
                >
                    {value}
                </Text>

                {showProgress && (
                    <View style={styles.progressBarContainer}>
                        <View
                            style={[
                                styles.progressBarBackground,
                                { backgroundColor: progressBackgroundColor },
                            ]}
                        >
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${clampedProgress}%`,
                                        backgroundColor: progressColor,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}

                {showComparison && comparisonText && (
                    <View style={styles.comparisonContainer}>
                        <Text
                            style={[
                                styles.comparisonText,
                                { color: comparisonColor },
                            ]}
                        >
                            {comparisonPercentage !== undefined && comparisonPercentage >= 0 ? '+' : ''}
                            {comparisonPercentage !== undefined ? `${comparisonPercentage}%` : ''} {comparisonText}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    )

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
            >
                {body}
            </Pressable>
        )
    }

    return body
}

const styles = StyleSheet.create({
    pressable: {
        borderRadius: 18,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
    },
        container: {
            flexDirection: "column",
            alignItems: "flex-start",
            borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
            gap: 16,
    },
    containerRegular: {
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    containerCompact: {
        paddingHorizontal: 14,
        paddingVertical: 22,
        flexDirection: "row",
    },
    iconRegular: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    iconCompact: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    textWrapper: {
        flex: 1,
            width: "100%",
    },
    titleRegular: {
        fontSize: 14,
        color: "#576B74",
        fontWeight: "500",
    },
    titleCompact: {
        fontSize: 12,
        color: "#6B7C82",
        fontWeight: "500",
    },
    valueRegular: {
            marginTop: 4,
        fontSize: 20,
        fontWeight: "700",
        color: DEFAULT_VALUE_COLOR,
    },
    valueCompact: {
        marginTop: 4,
        fontSize: 16,
        fontWeight: "700",
        color: DEFAULT_VALUE_COLOR,
    },
    progressBarContainer: {
        marginTop: 8,
        width: "100%",
    },
    progressBarBackground: {
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 3,
    },
    comparisonContainer: {
        marginTop: 6,
    },
    comparisonText: {
        fontSize: 11,
        fontWeight: "600",
    },
})