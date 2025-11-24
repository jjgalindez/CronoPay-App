// src/components/inputs/PinInput.tsx
import React from "react"
import { Pressable, Text, TextInput, View } from "react-native"

import { usePinCode } from "../../hooks/usePinCode"

import { cn } from "@/utils/cn"

type Props = { maxLength?: number; onComplete?: (code: string) => void }

export default function PinInput({ maxLength = 6, onComplete }: Props) {
  const { code, setCode, inputRef, focused, onPress, onBlur, isComplete } =
    usePinCode(maxLength)

  React.useEffect(() => {
    if (isComplete && onComplete) onComplete(code)
  }, [isComplete, code, onComplete])

  const renderBoxDigit = (index: number) => {
    const digit = code[index] ?? ""
    const isCurrentValue = index === code.length
    const isLastValue = index === maxLength - 1
    const isValueFocused = focused && (isCurrentValue || isLastValue)

    return (
      <View
        className={cn(
          "h-14 w-10 items-center justify-center rounded-[12px] bg-neutral-200",
          isValueFocused && "border-2 border-primary-400",
        )}
        key={index}
      >
        <Text className="text-xl font-bold text-black">{digit}</Text>
      </View>
    )
  }

  return (
    <View className="w-full">
      <Pressable
        className="flex flex-row justify-center px-4"
        style={{ columnGap: 24 }}
        onPress={onPress}
      >
        <View className="flex-row justify-between gap-2">
          {Array.from({ length: Math.ceil(maxLength / 2) }, (_, i) =>
            renderBoxDigit(i),
          )}
        </View>
        <View className="flex-row justify-between gap-2">
          {Array.from({ length: Math.floor(maxLength / 2) }, (_, i) =>
            renderBoxDigit(i + Math.ceil(maxLength / 2)),
          )}
        </View>
      </Pressable>
      <TextInput
        className="absolute"
        style={{ position: "absolute", opacity: 0, height: 40, width: 1 }}
        ref={inputRef}
        autoFocus
        value={code}
        onChangeText={setCode}
        maxLength={maxLength}
        keyboardType="number-pad"
        onBlur={onBlur}
      />
    </View>
  )
}
