// app/(onboarding)/perfil/editar.tsx
import Ionicons from "@expo/vector-icons/Ionicons"
import React from "react"
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
    <SafeAreaView className="flex-1 bg-white">
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
              className="font-bold text-gray-900"
              style={{
                fontSize: isSmallScreen ? 20 : 24,
                marginBottom: isSmallScreen ? 16 : 24,
              }}
            >
              Editar Perfil
            </Text>

            {/* Foto de Perfil */}
            <View
              className="items-center"
              style={{ marginBottom: isSmallScreen ? 24 : 32 }}
            >
              <View className="relative">
                {imagenAMostrar ? (
                  <View
                    className="overflow-hidden rounded-full border-2 border-gray-200"
                    style={{ width: avatarSize, height: avatarSize }}
                  >
                    <Image
                      source={{ uri: imagenAMostrar }}
                      style={{ width: avatarSize, height: avatarSize }}
                      resizeMode="cover"
                    />
                    {subiendoImagen && (
                      <View className="absolute inset-0 flex items-center justify-center bg-black/50">
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
                    className="items-center justify-center rounded-full border-2 border-gray-200 bg-green-500"
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
                  className={`font-medium ${subiendoImagen ? "text-gray-400" : "text-blue-500"
                    }`}
                >
                  {subiendoImagen
                    ? "Subiendo imagen..."
                    : "Cambiar foto de perfil"}
                </Text>
              </TouchableOpacity>

              <Text className="mt-2 text-center text-xs text-gray-500">
                Haz clic para cambiar tu foto. Máximo 5MB.
              </Text>
            </View>

            {/* Formulario */}
            <View className="rounded-lg bg-white">
              <View style={{ marginBottom: isSmallScreen ? 16 : 24 }}>
                <Text
                  className="font-medium text-gray-700"
                  style={{ marginBottom: 8, fontSize: isSmallScreen ? 14 : 16 }}
                >
                  Nombre completo
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 text-gray-900"
                  style={{
                    paddingHorizontal: isSmallScreen ? 12 : 16,
                    paddingVertical: isSmallScreen ? 12 : 16,
                    fontSize: isSmallScreen ? 14 : 16,
                    minHeight: isSmallScreen ? 44 : 52,
                  }}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ingresa tu nombre completo"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={{ marginBottom: isSmallScreen ? 24 : 32 }}>
                <Text
                  className="font-medium text-gray-700"
                  style={{ marginBottom: 8, fontSize: isSmallScreen ? 14 : 16 }}
                >
                  Correo electrónico
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
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
                  className="text-gray-500"
                  style={{ marginTop: 8, fontSize: isSmallScreen ? 12 : 14 }}
                >
                  El correo electrónico no se puede modificar por seguridad
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
                  {cargando ? "Guardando..." : "Guardar cambios"}
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
                  className="text-center font-medium text-gray-700"
                  style={{ fontSize: isSmallScreen ? 14 : 16 }}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Información de seguridad */}
            <View
              className="rounded-lg border border-blue-200 bg-blue-50"
              style={{
                marginTop: isSmallScreen ? 24 : 32,
                padding: isSmallScreen ? 12 : 16,
              }}
            >
              <View className="flex-row items-start" style={{ columnGap: 12 }}>
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
                    Sobre tu información personal
                  </Text>
                  <Text
                    className="text-blue-700"
                    style={{
                      fontSize: isSmallScreen ? 11 : 12,
                      lineHeight: isSmallScreen ? 16 : 18,
                    }}
                  >
                    Tu información personal está protegida y solo tú puedes
                    verla y modificarla. Nunca compartiremos tus datos con
                    terceros sin tu consentimiento explícito.
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
