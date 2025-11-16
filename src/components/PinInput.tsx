import React, { useEffect, useRef, useState } from "react"
import { Pressable, Text, TextInput, View } from "react-native"

import { cn } from "@/utils/cn"

const maximumLength = 6

type PinInputProps = {
  code: string
  setCode: (code: string) => void
}

const PinInput = ({ code, setCode }: PinInputProps) => {
  const inputRef = useRef<TextInput>(null)

  const [isInputBoxFocused, setIsInputBoxFocused] = useState(false)

  const handleOnPress = () => {
    setIsInputBoxFocused(true)
    inputRef.current?.focus()
  }

  const handleOnBlur = () => {
    setIsInputBoxFocused(false)
  }

  useEffect(() => {
    handleOnPress()
  }, [])

  const renderBoxDigit = (index: number) => {
    const emptyInput = ""
    const digit = code[index] ?? emptyInput

    const isCurrentValue = index === code.length
    const isLastValue = index === maximumLength - 1
    const isCodeComplete = code.length === maximumLength

    const isValueFocused = isCurrentValue || (isLastValue && isCodeComplete)

    return (
      <View
        className={cn(
          "h-14 w-10 items-center justify-center rounded-[12px] bg-neutral-200",
          isInputBoxFocused && isValueFocused && "border-2 border-primary-400",
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
        onPress={handleOnPress}
      >
        <View className="flex-row justify-between" style={{ columnGap: 8 }}>
          {renderBoxDigit(0)}
          {renderBoxDigit(1)}
          {renderBoxDigit(2)}
        </View>
        <View className="flex-row justify-between" style={{ columnGap: 8 }}>
          {renderBoxDigit(3)}
          {renderBoxDigit(4)}
          {renderBoxDigit(5)}
        </View>
      </Pressable>
      <TextInput
        className="absolute"
        style={{ position: "absolute", opacity: 0, height: 40, width: 1 }}
        ref={inputRef}
        autoFocus
        value={code}
        onChangeText={setCode}
        maxLength={maximumLength}
        keyboardType="number-pad"
        onBlur={handleOnBlur}
      />
    </View>
  )
}

export default PinInput
