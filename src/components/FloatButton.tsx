import React, { useState } from 'react'
import { TouchableOpacity, View, StyleSheet, type ViewStyle } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'

type IconName = React.ComponentProps<typeof Ionicons>['name']

type FloatButtonProps = {
  onPress?: () => void
  size?: number // diameter in px
  color?: string // background color
  iconName?: IconName
  iconColor?: string
  style?: ViewStyle
  position?: 'bottom-right' | 'bottom-left' | 'center'
  accessibilityLabel?: string
}

export default function FloatButton({
  onPress = () => {},
  size = 56,
  color = '#06B6D4',
  iconName = 'add',
  iconColor = '#FFFFFF',
  style,
  position = 'bottom-right',
  accessibilityLabel = 'Acción principal',
}: FloatButtonProps) {
  const [disabled, setDisabled] = useState(false)
  const posStyle: ViewStyle =
    position === 'bottom-left'
      ? { left: 16, bottom: 24 }
      : position === 'center'
      ? { left: '50%', transform: [{ translateX: -size / 2 }] as any, bottom: 24 }
      : { right: 16, bottom: 24 }

  async function handlePress() {
    if (disabled) return
    try {
      setDisabled(true)
      const res = onPress()
      // If onPress returns a promise, wait for it before re-enabling
      if (typeof res !== 'undefined' && typeof (res as any)?.then === 'function') {
        await res
      } else {
        // otherwise ensure short debounce so user can't spam the button
        await new Promise((r) => setTimeout(r, 800))
      }
    } catch (e) {
      // ignore - re-enable below
    } finally {
      setDisabled(false)
    }
  }

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        posStyle as any,
        style,
        disabled && { opacity: 0.6 },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={Math.floor(size * 0.5)} color={iconColor} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 50,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
