// src/components/auth/EmailPasswordForm.tsx
import { router } from "expo-router"
import { supabase } from "lib/supabase"
import { use, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native"

export function EmailPasswordForm() {
  const { t } = useTranslation()

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
      setError(err.message ?? t("login.defaultError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View>
      <TextInput
        placeholder={t("login.emailPlaceholder")}
        placeholderTextColor="#9ca3af"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        className="mb-3 rounded-lg border border-neutral-300 bg-white p-3 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100"
      />
      <TextInput
        placeholder={t("login.passwordPlaceholder")}
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="mb-3 rounded-lg border border-neutral-300 bg-white p-3 text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100"
      />
      {error && <Text className="mb-3 text-red-500">{error}</Text>}
      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        className={`items-center rounded-lg p-4 ${isLoading ? "bg-neutral-400" : "bg-[#2791B5]"
          }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-bold text-white">{t("home.loginButton")}</Text>
        )}
      </Pressable>
    </View>
  )
}
