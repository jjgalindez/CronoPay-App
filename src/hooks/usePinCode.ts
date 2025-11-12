// src/hooks/usePinCode.ts
import { useEffect, useRef, useState } from "react"
import { TextInput } from "react-native"

export function usePinCode(maxLength = 6) {
  const inputRef = useRef<TextInput>(null)
  const [code, setCode] = useState("")
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
    setFocused(true)
  }, [])

  const onPress = () => {
    setFocused(true)
    inputRef.current?.focus()
  }

  const onBlur = () => setFocused(false)

  const isComplete = code.length === maxLength

  return {
    inputRef,
    code,
    setCode,
    focused,
    isComplete,
    onPress,
    onBlur,
    maxLength,
  }
}
