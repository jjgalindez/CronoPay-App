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

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "com.edrickleong.smartbank://auth", // tu scheme configurado
          data: { full_name: name },
        },
      })

      if (error) throw error

      // Navegar a pantalla de éxito
      router.push("/(unauthenticated)/confirm-email?email=" + email)
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
          Crear cuenta
        </Text>

        <TextInput
          placeholder="Nombre completo"
          value={name}
          onChangeText={setName}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
          }}
        />

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

        <TextInput
          placeholder="Repite tu contraseña"
          secureTextEntry
          value={repeatPassword}
          onChangeText={setRepeatPassword}
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
          onPress={handleSignUp}
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
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Registrarse
            </Text>
          )}
        </Pressable>

        <Text style={{ marginTop: 16, textAlign: "center" }}>
          ¿Ya tienes cuenta?{" "}
          <Text
            style={{ color: "#2791B5" }}
            onPress={() => router.push("/login")}
          >
            Inicia sesión
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  )
}
