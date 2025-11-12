// src/components/auth/SignUpForm.tsx
import { router } from "expo-router"
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native"

import { useSignUp } from "../../hooks/useSignUp"

export function SignUpForm() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    repeatPassword,
    setRepeatPassword,
    error,
    isLoading,
    handleSignUp,
  } = useSignUp()

  return (
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

      {error && <Text style={{ color: "red", marginBottom: 12 }}>{error}</Text>}

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
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Registrarse</Text>
        )}
      </Pressable>

      <Text style={{ marginTop: 16, textAlign: "center" }}>
        ¿Ya tienes cuenta?{" "}
        <Text
          style={{ color: "#2791B5" }}
          onPress={() => router.push("/(unauthenticated)/login")}
        >
          Inicia sesión
        </Text>
      </Text>
    </View>
  )
}
