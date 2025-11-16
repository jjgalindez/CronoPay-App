// src/components/auth/SignUpForm.tsx
import { router } from "expo-router"
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native"

import GoogleSign from "./GoogleSign"
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
    <View className="flex-col space-y-8">
      {/* Encabezado */}
      <View className="space-y-1">
        <Text className="text-2xl font-bold text-neutral-900">
          Crear cuenta
        </Text>
        <Text className="mb-3 text-[15px] text-neutral-600">
          Regístrate con tu correo para comenzar.
        </Text>
      </View>

      {/* Tarjeta del formulario */}
      <View className=" space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 py-3">
        <TextInput
          placeholder="Nombre completo"
          placeholderTextColor="#6b7280"
          value={name}
          onChangeText={setName}
          className="rounded-xl border border-neutral-300 px-4  py-3 text-[15px] text-neutral-800"
        />

        <TextInput
          placeholder="Correo electrónico"
          placeholderTextColor="#6b7280"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          className="rounded-xl border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800"
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#6b7280"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="rounded-xl border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800"
        />

        <TextInput
          placeholder="Repite tu contraseña"
          placeholderTextColor="#6b7280"
          secureTextEntry
          value={repeatPassword}
          onChangeText={setRepeatPassword}
          className="rounded-xl border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800"
        />

        {error && (
          <Text className="text-center text-[14px] text-red-500">{error}</Text>
        )}

        {/* Botón de registro */}
        <Pressable
          onPress={handleSignUp}
          disabled={isLoading}
          className={`items-center rounded-xl py-3 ${
            isLoading ? "bg-neutral-300" : "bg-teal-600"
          } active:opacity-80`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-[15px] font-semibold text-white">
              Registrarse
            </Text>
          )}
        </Pressable>

        <View className="my-1 flex-row items-center">
          <View className="h-px flex-1 bg-neutral-200" />
          <Text className="mx-3 text-[13px] text-neutral-500">
            o continúa con
          </Text>
          <View className="h-px flex-1 bg-neutral-200" />
        </View>

        {/* Botón Google */}
        <GoogleSign />
      </View>

      {/* Enlace a login */}
      <View className="items-center pt-2">
        <Text className="text-[15px] text-neutral-600">
          ¿Ya tienes cuenta?{" "}
          <Text
            onPress={() => router.push("/(unauthenticated)/login")}
            className="font-semibold"
            style={{ color: "#2b9fc4" }}
          >
            Inicia sesión
          </Text>
        </Text>
      </View>
    </View>
  )
}
