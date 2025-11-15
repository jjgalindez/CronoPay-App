// src/components/auth/EmailPasswordForm.tsx
import { router } from "expo-router"
import { supabase } from "lib/supabase"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native"

export function EmailPasswordForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.replace("/(tabs)/inicio")
    } catch (err: any) {
      setError(err.message ?? "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View>
      <TextInput
        placeholder="Correo electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
        }}
      />
      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
        }}
      />
      {error && <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>}
      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "#ccc" : "#2791B5",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Entrar</Text>
        )}
      </Pressable>
    </View>
  )
}
