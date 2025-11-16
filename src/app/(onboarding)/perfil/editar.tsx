// app/(onboarding)/perfil/editar.tsx
import React, { useState } from "react"
import { 
  TouchableOpacity, 
  View, 
  ScrollView, 
  TextInput, 
  Alert, 
  Text,
  Image,
  Platform 
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../../../providers/AuthProvider"
import { useUsuarioPerfil } from "../../../hooks/useUsuarioPerfil"
import * as ImagePicker from 'expo-image-picker'
import Ionicons from "@expo/vector-icons/Ionicons"
import { supabase } from "../../../../lib/supabase"
import { router } from "expo-router"

export default function EditarPerfilScreen() {
  const { session } = useAuth()
  const { data: perfil, refetch } = useUsuarioPerfil(session?.user?.id)
  
  const [nombre, setNombre] = useState(perfil?.nombre || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [fotoPerfil, setFotoPerfil] = useState(perfil?.avatar_url || null)
  const [cargando, setCargando] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  // Función para verificar permisos
  const verificarPermisos = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (newStatus !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para cambiar la foto de perfil')
          return false
        }
      }
    }
    return true
  }

  // Función para subir imagen a Supabase Storage
  const subirImagenASupabase = async (uri: string, nombreArchivo: string) => {
    try {
      // Convertir URI a blob
      const response = await fetch(uri)
      const blob = await response.blob()

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('UserData')
        .upload(`avatars/${nombreArchivo}`, blob, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('UserData')
        .getPublicUrl(`avatars/${nombreArchivo}`)

      return publicUrl
    } catch (error) {
      console.error('Error subiendo imagen:', error)
      throw error
    }
  }

  // Función para eliminar imagen anterior si existe
  const eliminarImagenAnterior = async (urlAnterior: string) => {
    try {
      if (!urlAnterior || !urlAnterior.includes('avatars/')) return
      
      // Extraer el nombre del archivo de la URL
      const nombreArchivo = urlAnterior.split('avatars/').pop()
      if (!nombreArchivo) return

      const { error } = await supabase.storage
        .from('UserData')
        .remove([`avatars/${nombreArchivo}`])

      if (error) {
        console.warn('No se pudo eliminar la imagen anterior:', error)
      }
    } catch (error) {
      console.warn('Error eliminando imagen anterior:', error)
    }
  }

  // Función para seleccionar imagen de la galería
  const seleccionarFoto = async () => {
    try {
      const permisosOtorgados = await verificarPermisos()
      if (!permisosOtorgados) return

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!resultado.canceled) {
        const imagen = resultado.assets[0]
        
        // Validar tipo de archivo
        const tiposValidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!tiposValidos.includes(imagen.type || 'image/jpeg')) {
          Alert.alert('Error', 'Por favor selecciona una imagen válida (JPG, PNG, WEBP o GIF)')
          return
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (imagen.fileSize && imagen.fileSize > maxSize) {
          Alert.alert('Error', 'La imagen debe ser menor a 5MB')
          return
        }

        setSubiendoImagen(true)

        try {
          // Generar nombre único para el archivo
          const extension = imagen.uri.split('.').pop() || 'jpg'
          const nombreArchivo = `${session?.user?.id}-${Date.now()}.${extension}`

          // Subir imagen a Supabase
          const publicUrl = await subirImagenASupabase(imagen.uri, nombreArchivo)
          
          // Si había una imagen anterior, eliminarla
          if (perfil?.avatar_url && perfil.avatar_url !== publicUrl) {
            await eliminarImagenAnterior(perfil.avatar_url)
          }
          
          // Actualizar estado con nueva URL
          setFotoPerfil(publicUrl)
          
        } catch (error) {
          Alert.alert('Error', 'No se pudo subir la imagen')
          console.error('Error subiendo imagen:', error)
        } finally {
          setSubiendoImagen(false)
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen')
      console.error('Error seleccionando imagen:', error)
    }
  }

  // Función para actualizar perfil en la tabla usuarios_perfil
  const actualizarPerfilEnBD = async () => {
    if (!session?.user?.id) {
      throw new Error('No hay usuario autenticado')
    }

    const { error } = await supabase
      .from('usuarios_perfil')
      .update({ 
        nombre: nombre.trim(),
        avatar_url: fotoPerfil
      })
      .eq('id', session.user.id)

    if (error) throw error
  }

  // Función para guardar cambios en la base de datos
  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío")
      return
    }

    setCargando(true)
    try {
      await actualizarPerfilEnBD()
      
      Alert.alert(
        "Éxito", 
        "Perfil actualizado correctamente",
        [
          {
            text: "OK",
            onPress: () => {
              refetch()
              router.back()
            }
          }
        ]
      )
    } catch (error) {
      console.error('Error actualizando perfil:', error)
      Alert.alert("Error", "No se pudo actualizar el perfil")
    } finally {
      setCargando(false)
    }
  }

  const getIniciales = (nombre: string) => {
    return nombre
      .split(' ')
      .map(palabra => palabra[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const esImagenGoogle = fotoPerfil?.includes("googleusercontent.com")

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</Text>
          
          {/* Foto de Perfil */}
          <View className="items-center mb-8">
            <View className="relative">
              {fotoPerfil ? (
                <View className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    source={{ uri: fotoPerfil }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {subiendoImagen && (
                    <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Ionicons name="cloud-upload" size={24} color="white" />
                    </View>
                  )}
                </View>
              ) : (
                <View className="w-32 h-32 rounded-full bg-green-500 items-center justify-center border-2 border-gray-200">
                  <Text className="text-white text-2xl font-bold">
                    {getIniciales(nombre || "Usuario")}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                onPress={seleccionarFoto}
                disabled={subiendoImagen}
                className="absolute -bottom-2 -right-2 bg-blue-500 w-10 h-10 rounded-full items-center justify-center border-2 border-white"
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={seleccionarFoto} 
              disabled={subiendoImagen}
              className="mt-4"
            >
              <Text className={`font-medium ${subiendoImagen ? 'text-gray-400' : 'text-blue-500'}`}>
                {subiendoImagen ? 'Subiendo imagen...' : 'Cambiar foto de perfil'}
              </Text>
            </TouchableOpacity>
            
            <Text className="text-xs text-gray-500 text-center mt-2">
              Haz clic para cambiar tu foto. Máximo 5MB.
            </Text>
          </View>

          {/* Formulario */}
          <View className="bg-white rounded-lg">
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Nombre completo</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-4 text-gray-900 text-base"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ingresa tu nombre completo"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View className="mb-8">
              <Text className="text-gray-700 mb-2 font-medium">Correo electrónico</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-4 bg-gray-100 text-gray-600 text-base"
                value={email}
                editable={false}
              />
              <Text className="text-gray-500 text-sm mt-2">
                El correo electrónico no se puede modificar por seguridad
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={handleGuardar}
              disabled={cargando}
              className={`py-4 rounded-lg mt-4 ${
                cargando ? 'bg-blue-400' : 'bg-blue-600'
              }`}
            >
              <Text className="text-white text-center font-semibold text-base">
                {cargando ? "Guardando..." : "Guardar cambios"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={cargando}
              className="py-4 rounded-lg mt-3 border border-gray-300"
            >
              <Text className="text-gray-700 text-center font-medium text-base">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Información de seguridad */}
          <View className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <View className="flex-row items-start gap-3">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <View className="flex-1">
                <Text className="font-semibold text-sm text-blue-800 mb-1">
                  Sobre tu información personal
                </Text>
                <Text className="text-xs text-blue-700 leading-4">
                  Tu información personal está protegida y solo tú puedes verla y modificarla. 
                  Nunca compartiremos tus datos con terceros sin tu consentimiento explícito.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}