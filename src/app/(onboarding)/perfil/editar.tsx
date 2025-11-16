// app/(onboarding)/perfil/editar.tsx
import React, { useState } from "react"
import { TouchableOpacity, View, ScrollView, TextInput, Alert, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../../../providers/AuthProvider"
import { useUsuarioPerfil } from "../../../hooks/useUsuarioPerfil"

export default function EditarPerfilScreen() {
  const { session } = useAuth()
  const { data: perfil, refetch } = useUsuarioPerfil(session?.user?.id)
  
  const [nombre, setNombre] = useState(perfil?.nombre || "")
  const [email, setEmail] = useState(session?.user?.email || "")

  const handleGuardar = () => {
    // Aquí implementarías la actualización del perfil en tu API
    Alert.alert("Éxito", "Perfil actualizado correctamente")
    refetch()
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</Text>
        
        <View className="bg-white rounded-lg">
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Nombre completo</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View className="mb-6">
            <Text className="text-gray-700 mb-2 font-medium">Correo electrónico</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
              value={email}
              onChangeText={setEmail}
              placeholder="Ingresa tu correo electrónico"
              placeholderTextColor="#9CA3AF"
              editable={false} // El email normalmente no se puede editar
            />
            <Text className="text-gray-500 text-sm mt-1">
              El correo electrónico no se puede modificar
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleGuardar}
            className="bg-blue-600 py-4 rounded-lg mt-4"
          >
            <Text className="text-white text-center font-semibold text-base">
              Guardar cambios
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}