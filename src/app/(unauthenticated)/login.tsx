import { router } from "expo-router"
import { useState } from "react"
import {
  Alert,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { supabase } from "../../../lib/supabase" // tu cliente inicializado

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Si todo va bien, navega al sistema de pestañas protegido
      router.replace("/(tabs)/inicio")
    } catch (err: any) {
      setError(err.message ?? "Ocurrió un error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Iniciar sesión
        </Text>

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

        {error && (
          <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>
        )}

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

        <Text style={{ marginTop: 16, textAlign: "center" }}>
          ¿No tienes cuenta?{" "}
          <Text
            style={{ color: "#2791B5" }}
            onPress={() => router.push("/(unauthenticated)/sign-up")}
          >
            Regístrate
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  )
}
