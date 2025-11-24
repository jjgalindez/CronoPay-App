// src/hooks/useEditarPerfil.ts
import { router } from "expo-router"
import { useState, useEffect, useCallback } from "react"
import { Alert, Platform } from "react-native"
import ImagePicker from "react-native-image-crop-picker"

import { useUsuarioPerfil } from "./useUsuarioPerfil"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../providers/AuthProvider"

export function useEditarPerfil() {
  const { session } = useAuth()
  const { data: perfil, refetch, update } = useUsuarioPerfil(session?.user?.id)

  const [nombre, setNombre] = useState(perfil?.nombre || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [fotoPerfil, setFotoPerfil] = useState(perfil?.avatar_url || null)
  const [fotoPerfilOriginal, setFotoPerfilOriginal] = useState(
    perfil?.avatar_url || null,
  )
  const [fotoPerfilLocal, setFotoPerfilLocal] = useState<string | null>(null)
  const [imagenTemporal, setImagenTemporal] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  // Sincronizar estados cuando cambie el perfil
  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre || "")
      setFotoPerfil(perfil.avatar_url || null)
      setFotoPerfilOriginal(perfil.avatar_url || null)
    }
  }, [perfil])

  // Sincronizar email cuando cambie la sesión
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
  }, [session])

  // Limpiar imagen temporal al desmontar
  useEffect(() => {
    return () => {
      if (imagenTemporal && fotoPerfil !== fotoPerfilOriginal) {
        eliminarImagenAnterior(imagenTemporal).catch((err) =>
          console.warn("Error limpiando imagen temporal:", err),
        )
      }
    }
  }, [imagenTemporal, fotoPerfil, fotoPerfilOriginal, eliminarImagenAnterior])

  // Verificar permisos ya no es necesario con react-native-image-crop-picker
  // La librería maneja los permisos automáticamente

  // Subir imagen a Supabase Storage
  const subirImagenASupabase = useCallback(
    async (
      uri: string,
      nombreArchivo: string,
      mimeType: string = "image/jpeg",
    ) => {
      try {
        console.log("📤 Iniciando subida de imagen:", {
          uri,
          nombreArchivo,
          mimeType,
        })

        // Normalizar URI para Android
        let normalizedUri = uri
        if (Platform.OS === "android" && !uri.startsWith("file://")) {
          normalizedUri = `file://${uri}`
        }

        console.log("🔄 URI normalizada:", normalizedUri)

        // Leer el archivo como blob
        const response = await fetch(normalizedUri)
        console.log("📥 Respuesta de fetch:", response.status, response.ok)

        const blob = await response.blob()
        console.log("📦 Blob creado:", blob.size, "bytes", blob.type)

        // Convertir blob a ArrayBuffer
        const arrayBuffer = await new Promise<ArrayBuffer>(
          (resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              console.log(
                "✅ ArrayBuffer creado:",
                (reader.result as ArrayBuffer).byteLength,
                "bytes",
              )
              resolve(reader.result as ArrayBuffer)
            }
            reader.onerror = reject
            reader.readAsArrayBuffer(blob)
          },
        )

        // Subir el ArrayBuffer
        console.log("☁️ Subiendo a Supabase...")
        const { data, error } = await supabase.storage
          .from("UserData")
          .upload(`avatars/${nombreArchivo}`, arrayBuffer, {
            cacheControl: "3600",
            upsert: true,
            contentType: mimeType,
          })

        if (error) {
          console.error("❌ Error de Supabase:", error)
          throw error
        }

        console.log("✅ Subida exitosa:", data)

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("UserData")
          .getPublicUrl(`avatars/${nombreArchivo}`)

        console.log("🔗 URL pública generada:", publicUrl)
        return publicUrl
      } catch (error) {
        console.error("❌ Error subiendo imagen:", error)
        throw error
      }
    },
    [],
  )

  // Eliminar imagen del bucket
  const eliminarImagenAnterior = useCallback(async (urlAnterior: string) => {
    try {
      if (!urlAnterior || !urlAnterior.includes("avatars/")) return

      const nombreArchivo = urlAnterior.split("avatars/").pop()
      if (!nombreArchivo) return

      const { error } = await supabase.storage
        .from("UserData")
        .remove([`avatars/${nombreArchivo}`])

      if (error) {
        console.warn("No se pudo eliminar la imagen anterior:", error)
      }
    } catch (error) {
      console.warn("Error eliminando imagen anterior:", error)
    }
  }, [])

  // Seleccionar foto de la galería con recorte
  const seleccionarFoto = useCallback(async () => {
    try {
      console.log("📸 Abriendo selector de imagen...")
      const imagen = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
        mediaType: "photo",
        includeBase64: false,
      })

      console.log("🖼️ Imagen seleccionada:", {
        path: imagen.path,
        size: imagen.size,
        mime: imagen.mime,
        width: imagen.width,
        height: imagen.height,
      })

      // Validar tamaño
      const maxSize = 5 * 1024 * 1024
      if (imagen.size && imagen.size > maxSize) {
        Alert.alert("Error", "La imagen debe ser menor a 5MB")
        return
      }

      // Preview inmediato
      console.log("👁️ Mostrando preview local:", imagen.path)
      setFotoPerfilLocal(imagen.path)
      setSubiendoImagen(true)

      try {
        // Preparar archivo
        const uri = imagen.path
        const extension = uri.split(".").pop()?.toLowerCase() || "jpg"
        const nombreArchivo = `${session?.user?.id}-${Date.now()}.${extension}`
        const mimeType = imagen.mime || "image/jpeg"

        console.log("🚀 Iniciando proceso de subida...")
        // Subir
        const publicUrl = await subirImagenASupabase(
          uri,
          nombreArchivo,
          mimeType,
        )
        console.log("✅ URL pública obtenida:", publicUrl)

        // Eliminar temporal anterior si existe
        if (fotoPerfil && fotoPerfil !== fotoPerfilOriginal) {
          console.log("🗑️ Eliminando imagen anterior:", fotoPerfil)
          await eliminarImagenAnterior(fotoPerfil)
        }

        // Actualizar estados
        console.log("💾 Actualizando estados con URL:", publicUrl)
        setFotoPerfil(publicUrl)
        setImagenTemporal(publicUrl)
        setFotoPerfilLocal(null)
        console.log("✅ Estados actualizados correctamente")
      } catch (error) {
        console.error("❌ Error en proceso de subida:", error)
        Alert.alert("Error", "No se pudo subir la imagen")
      } finally {
        console.log("🏁 Finalizando proceso de subida")
        setSubiendoImagen(false)
      }
    } catch (error) {
      console.error("❌ Error seleccionando imagen:", error)
      Alert.alert("Error", "No se pudo seleccionar la imagen")
      setFotoPerfilLocal(null)
    }
  }, [
    session?.user?.id,
    fotoPerfil,
    fotoPerfilOriginal,
    subirImagenASupabase,
    eliminarImagenAnterior,
  ])

  // Guardar cambios
  const handleGuardar = useCallback(async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío")
      return
    }

    if (!session?.user?.id) {
      Alert.alert("Error", "No hay sesión activa")
      return
    }

    setCargando(true)
    try {
      await update({
        nombre: nombre.trim(),
        avatar_url: fotoPerfil || undefined,
      })

      // Eliminar imagen original si cambió
      if (
        fotoPerfilOriginal &&
        fotoPerfil &&
        fotoPerfilOriginal !== fotoPerfil
      ) {
        await eliminarImagenAnterior(fotoPerfilOriginal).catch((err) =>
          console.warn("Error eliminando imagen anterior:", err),
        )
      }

      // Limpiar flags
      setImagenTemporal(null)
      setFotoPerfilOriginal(fotoPerfil)

      Alert.alert("Éxito", "Perfil actualizado correctamente", [
        {
          text: "OK",
          onPress: () => {
            refetch()
            router.back()
          },
        },
      ])
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil",
      )
    } finally {
      setCargando(false)
    }
  }, [
    nombre,
    session?.user?.id,
    fotoPerfil,
    fotoPerfilOriginal,
    update,
    refetch,
    eliminarImagenAnterior,
  ])

  // Cancelar cambios
  const handleCancelar = useCallback(async () => {
    if (imagenTemporal && fotoPerfil !== fotoPerfilOriginal) {
      try {
        await eliminarImagenAnterior(imagenTemporal)
      } catch (error) {
        console.warn("Error eliminando imagen temporal al cancelar:", error)
      }
    }
    setFotoPerfilLocal(null)
    router.back()
  }, [imagenTemporal, fotoPerfil, fotoPerfilOriginal, eliminarImagenAnterior])

  // Obtener iniciales del nombre
  const getIniciales = useCallback((nombreCompleto: string) => {
    return nombreCompleto
      .split(" ")
      .map((palabra) => palabra[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [])

  // Imagen a mostrar (preview local o URL pública)
  const imagenAMostrar = fotoPerfilLocal || fotoPerfil

  return {
    // Estados
    nombre,
    email,
    imagenAMostrar,
    cargando,
    subiendoImagen,

    // Setters
    setNombre,

    // Funciones
    seleccionarFoto,
    handleGuardar,
    handleCancelar,
    getIniciales,
  }
}
