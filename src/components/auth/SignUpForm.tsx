// src/components/auth/SignUpForm.tsx
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation()

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
        <Text className="text-2xl font-bold text-neutral-900 dark:text-gray-100">
          {t("signup.title")}
        </Text>
        <Text className="mb-3 text-[15px] text-neutral-600">
          {t("signup.subtitle")}
        </Text>
      </View>

      {/* Tarjeta del formulario */}
      <View className=" space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 py-3 dark:border-neutral-700 dark:bg-neutral-900">
        <View className="mt-3 space-y-5">
          <TextInput
            placeholder={t("signup.namePlaceholder")}
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
            className="rounded-xl border border-neutral-300 px-4  py-3 text-[15px] text-neutral-800"
          />
        </View>
        <View className="mt-3 space-y-5">
          <TextInput
            placeholder={t("login.emailPlaceholder")}
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800"
          />
        </View>
        <View className="mt-3 space-y-5">
          <TextInput
            placeholder={t("login.passwordPlaceholder")}
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800"
          />
        </View>
        <View className="mt-3 space-y-5">
          <TextInput
            placeholder={t("signup.repeatPasswordPlaceholder")}
            placeholderTextColor="#6b7280"
            secureTextEntry
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-[15px] text-neutral-800"
          />
        </View>
        {error && (
          <Text className="text-center text-[14px] text-red-500">{error}</Text>
        )}
        <View className="mt-3 space-y-5">
          {/* Botón de registro */}
          <Pressable
            onPress={handleSignUp}
            disabled={isLoading}
            className={`items-center rounded-xl py-3 ${isLoading ? "bg-neutral-300" : "bg-teal-600"
              } active:opacity-80`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-[15px] font-semibold text-white">
                {t("signup.button")}
              </Text>
            )}
          </Pressable>
        </View>

        <View className="my-1 flex-row items-center">
          <View className="h-px flex-1 bg-neutral-200" />
          <Text className="mx-3 text-[13px] text-neutral-500">
            {t("login.continueWith")}
          </Text>
          <View className="h-px flex-1 bg-neutral-200" />
        </View>

        {/* Botón Google */}
        <GoogleSign />
      </View>

      {/* Enlace a login */}
      <View className="items-center pt-2">
        <Text className="text-[15px] text-neutral-600">
          {t("signup.alreadyHaveAccount")}{" "}
          <Text
            onPress={() => router.push("/(unauthenticated)/login")}
            className="font-semibold"
            style={{ color: "#2b9fc4" }}
          >
            {t("home.loginButton")}
          </Text>
        </Text>
      </View>
    </View>
  )
}
