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
        placeholderTextColor="#9ca3af"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        className="border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-gray-100 p-3 mb-3 rounded-lg"
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-gray-100 p-3 mb-3 rounded-lg"
      />
      {error && <Text className="text-red-500 mb-3">{error}</Text>}
      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        className={`p-4 rounded-lg items-center ${isLoading ? 'bg-neutral-400' : 'bg-[#2791B5]'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold">Entrar</Text>
        )}
      </Pressable>
    </View>
  )
}
