// app/(onboarding)/perfil/editar.tsx
import Ionicons from "@expo/vector-icons/Ionicons"
import React from "react"
import { useTranslation } from 'react-i18next'
import {
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Text,
  Image,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { useEditarPerfil } from "../../../hooks/useEditarPerfil"

export default function EditarPerfilScreen() {
  const { width } = useWindowDimensions()
  const { t } = useTranslation()
  const {
    nombre,
    email,
    imagenAMostrar,
    cargando,
    subiendoImagen,
    setNombre,
    seleccionarFoto,
    handleGuardar,
    handleCancelar,
    getIniciales,
  } = useEditarPerfil()

  const isSmallScreen = width < 375
  const avatarSize = isSmallScreen ? 96 : 128
  const horizontalPadding = Math.max(16, width * 0.05)

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ padding: horizontalPadding }}>
            <Text
              className="font-bold text-gray-900 dark:text-gray-100"
              style={{
                fontSize: isSmallScreen ? 20 : 24,
                marginBottom: isSmallScreen ? 16 : 24,
              }}
            >
              {t('editProfile')}
            </Text>

            {/* Foto de Perfil */}
            <View
              className="items-center"
              style={{ marginBottom: isSmallScreen ? 24 : 32 }}
            >
              <View className="relative">
                {imagenAMostrar ? (
                  <View
                    className="overflow-hidden rounded-full border-2 border-gray-200 dark:border-gray-700"
                    style={{ width: avatarSize, height: avatarSize }}
                  >
                    <Image
                      source={{ uri: imagenAMostrar }}
                      style={{ width: avatarSize, height: avatarSize }}
                      resizeMode="cover"
                    />
                    {subiendoImagen && (
                      <View className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                        <Ionicons
                          name="cloud-upload"
                          size={avatarSize * 0.2}
                          color="white"
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <View
                    className="items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700 bg-green-500"
                    style={{ width: avatarSize, height: avatarSize }}
                  >
                    <Text
                      className="font-bold text-white"
                      style={{ fontSize: avatarSize * 0.25 }}
                    >
                      {getIniciales(nombre || "Usuario")}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={seleccionarFoto}
                  disabled={subiendoImagen}
                  className="absolute -bottom-2 -right-2 items-center justify-center rounded-full border-2 border-white bg-blue-500"
                  style={{ width: avatarSize * 0.3, height: avatarSize * 0.3 }}
                >
                  <Ionicons
                    name="camera"
                    size={avatarSize * 0.15}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

                <TouchableOpacity
                  onPress={seleccionarFoto}
                  disabled={subiendoImagen}
                  className="mt-4"
                >
                  <Text
                    className={`font-medium ${subiendoImagen ? "text-gray-400" : "text-blue-500 dark:text-blue-400"
                      }`}
                  >
                    {subiendoImagen ? t('uploadingImage') : t('changeProfilePhoto')}
                  </Text>
                </TouchableOpacity>

              <Text className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                {t('clickToChangePhoto')}
              </Text>
            </View>

            {/* Formulario */}
            <View className="rounded-lg bg-white dark:bg-slate-900">
              <View style={{ marginBottom: isSmallScreen ? 16 : 24 }}>
                <Text
                  className="font-medium text-gray-700"
                  style={{ marginBottom: 8, fontSize: isSmallScreen ? 14 : 16 }}
                >
                  {t('fullName')}
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                  style={{
                    paddingHorizontal: isSmallScreen ? 12 : 16,
                    paddingVertical: isSmallScreen ? 12 : 16,
                    fontSize: isSmallScreen ? 14 : 16,
                    minHeight: isSmallScreen ? 44 : 52,
                  }}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder={t('enterFullName')}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={{ marginBottom: isSmallScreen ? 24 : 32 }}>
                <Text
                  className="font-medium text-gray-700"
                  style={{ marginBottom: 8, fontSize: isSmallScreen ? 14 : 16 }}
                >
                  {t('emailAddress')}
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400"
                  style={{
                    paddingHorizontal: isSmallScreen ? 12 : 16,
                    paddingVertical: isSmallScreen ? 12 : 16,
                    fontSize: isSmallScreen ? 14 : 16,
                    minHeight: isSmallScreen ? 44 : 52,
                  }}
                  value={email}
                  editable={false}
                />
                <Text
                  className="text-gray-500 dark:text-gray-400"
                  style={{ marginTop: 8, fontSize: isSmallScreen ? 12 : 14 }}
                >
                  {t('emailCannotModify')}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleGuardar}
                disabled={cargando}
                className={`rounded-lg ${cargando ? "bg-blue-400" : "bg-blue-600"
                  }`}
                style={{
                  paddingVertical: isSmallScreen ? 14 : 16,
                  marginTop: isSmallScreen ? 12 : 16,
                  minHeight: isSmallScreen ? 44 : 52,
                }}
              >
                <Text
                  className="text-center font-semibold text-white"
                  style={{ fontSize: isSmallScreen ? 14 : 16 }}
                >
                  {cargando ? t('saving') : t('saveChanges')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelar}
                disabled={cargando}
                className="rounded-lg border border-gray-300"
                style={{
                  paddingVertical: isSmallScreen ? 14 : 16,
                  marginTop: 12,
                  minHeight: isSmallScreen ? 44 : 52,
                }}
              >
                <Text
                  className="text-center font-medium text-gray-700 dark:text-gray-300"
                  style={{ fontSize: isSmallScreen ? 14 : 16 }}
                >
                  {t('Cancel')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Información de seguridad */}
            <View
              className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30"
              style={{
                marginTop: isSmallScreen ? 24 : 32,
                padding: isSmallScreen ? 12 : 16,
              }}
            >
              <View className="flex-row items-start gap-3">
                <Ionicons
                  name="information-circle"
                  size={isSmallScreen ? 18 : 20}
                  color="#3B82F6"
                />
                <View className="flex-1">
                  <Text
                    className="font-semibold text-blue-800"
                    style={{
                      fontSize: isSmallScreen ? 12 : 14,
                      marginBottom: 4,
                    }}
                  >
                    {t('aboutPersonalInfoTitle')}
                  </Text>
                  <Text
                    className="text-blue-700"
                    style={{
                      fontSize: isSmallScreen ? 11 : 12,
                      lineHeight: isSmallScreen ? 16 : 18,
                    }}
                  >
                    {t('aboutPersonalInfoBody')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
