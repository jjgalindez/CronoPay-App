// src/components/auth/GoogleButton.tsx
import { Pressable, Text } from "react-native"

import { useGoogleOAuth } from "../../hooks/useGoogleOAuth"

export function GoogleButton() {
  const { signInWithGoogle } = useGoogleOAuth()

  return (
    <Pressable
      onPress={signInWithGoogle}
      style={{
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
      }}
    >
      <Text style={{ color: "#000", fontWeight: "bold" }}>
        Continuar con Google
      </Text>
    </Pressable>
  )
}
