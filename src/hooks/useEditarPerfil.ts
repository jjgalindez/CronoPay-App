// src/hooks/useEditarPerfil.ts
import { router } from "expo-router"
import { useState, useEffect, useCallback, useRef } from "react"
import { Platform } from "react-native"
import showToast from '../utils/toast'
import ImagePicker from "react-native-image-crop-picker"
import * as Crypto from 'expo-crypto'

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
  const [uploadedPath, setUploadedPath] = useState<string | null>(null)
  const [uploadedHash, setUploadedHash] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  // Ref para evitar que el cleanup borre la imagen si el usuario guardó cambios
  const keepUploadedOnSave = useRef(false)

  // Helper: normaliza una URL o path a la ruta de storage (ej. "avatars/archivo.jpg")
  const getStoragePathFromUrl = useCallback((urlOrPath?: string | null) => {
    if (!urlOrPath) return null
    if (urlOrPath.startsWith("avatars/")) return urlOrPath
    if (urlOrPath.includes("avatars/")) {
      const parts = urlOrPath.split("avatars/")
      if (parts.length > 1) {
        return `avatars/${parts[1].split('?')[0]}`
      }
    }
    return null
  }, [])

  // Nota: la funcionalidad de borrado en el storage se ha deshabilitado
  // Anteriormente existía `eliminarImagenAnterior` que removía objetos
  // del bucket. Lo mantenemos fuera del hook para evitar borrados
  // accidentales; las llamadas a borrado se reemplazan por logs.

  // Calcular SHA256 a partir de un ArrayBuffer (convertimos a hex y hasheamos)
  const computeSha256FromArrayBuffer = useCallback(
    async (buffer: ArrayBuffer) => {
      const bytes = new Uint8Array(buffer)
      // convertir a hex string
      let hex = ''
      for (let i = 0; i < bytes.length; i++) {
        const h = bytes[i].toString(16).padStart(2, '0')
        hex += h
      }
      // usar expo-crypto para hashear la representación hex
      const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, hex)
      console.log('[useEditarPerfil] computeSha256FromArrayBuffer -> hash:', hash)
      return hash
    }, []);

  // Calcular SHA256 a partir de una URL pública (fetch -> arrayBuffer -> hash)
  const computeSha256FromUrl = useCallback(async (url: string | null) => {
    if (!url) return null
    try {
      console.log('[useEditarPerfil] computeSha256FromUrl fetching:', url)
      const res = await fetch(url)
      if (!res.ok) return null
      const buffer = await res.arrayBuffer()
      return await computeSha256FromArrayBuffer(buffer)
    } catch (e) {
      console.warn('Error calculando hash desde URL:', e)
      return null
    }
  }, [computeSha256FromArrayBuffer])

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
      // Si hay una imagen subida temporalmente y el usuario no la guardó,
      // eliminamos el archivo subido usando su path en el storage.
      if (uploadedPath) {
        if (keepUploadedOnSave.current) {
          console.log('[useEditarPerfil] cleanup: preservando uploadedPath porque el usuario guardó (skip delete)')
          return
        }
        // si tenemos hash del archivo subido, comparamos con el original por contenido
        (async () => {
          try {
            if (uploadedHash && fotoPerfilOriginal) {
              console.log('[useEditarPerfil] cleanup: comparing uploadedHash with original')
              const origPath = getStoragePathFromUrl(fotoPerfilOriginal)
              const origPublicUrl = origPath ? (supabase.storage.from('UserData').getPublicUrl(origPath).data?.publicUrl || null) : null
              console.log('[useEditarPerfil] cleanup: origPublicUrl=', origPublicUrl, ' uploadedHash=', uploadedHash)
              const origHash = await computeSha256FromUrl(origPublicUrl)
              console.log('[useEditarPerfil] cleanup: origHash=', origHash)
              if (!origHash || origHash !== uploadedHash) {
                console.log('[useEditarPerfil] cleanup: hashes differ -> deletion disabled (no-op) for', uploadedPath)
              } else {
                console.log('[useEditarPerfil] cleanup: hashes equal -> not deleting uploadedPath')
              }
            } else {
              // fallback a comparar rutas
              const currentPath = getStoragePathFromUrl(fotoPerfil)
              const originalPath = getStoragePathFromUrl(fotoPerfilOriginal)
              console.log('[useEditarPerfil] cleanup: path compare currentPath=', currentPath, 'originalPath=', originalPath)
              if (currentPath !== originalPath) {
                console.log('[useEditarPerfil] cleanup: paths differ -> deletion disabled (no-op) for', uploadedPath)
              } else {
                console.log('[useEditarPerfil] cleanup: paths equal -> not deleting uploadedPath')
              }
            }
          } catch (err) {
            console.warn("Error limpiando imagen temporal:", err)
          }
        })()
      }
    }
  }, [uploadedPath, fotoPerfil, fotoPerfilOriginal, getStoragePathFromUrl])

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
          }
        )

        // Subir el ArrayBuffer
        console.log("☁️ Subiendo a Supabase...")
        const storagePath = `avatars/${nombreArchivo}`
        const { data, error } = await supabase.storage
          .from("UserData")
          .upload(storagePath, arrayBuffer, {
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
          .getPublicUrl(storagePath)

        console.log("🔗 URL pública generada:", publicUrl)
        // calcular hash del arrayBuffer y devolverlo
        try {
          const hash = await computeSha256FromArrayBuffer(arrayBuffer)
          console.log('[useEditarPerfil] subirImagenASupabase -> computed hash for upload:', hash)
          return { publicUrl, storagePath, hash }
        } catch (e) {
          console.warn('No se pudo calcular hash del archivo subido:', e)
          return { publicUrl, storagePath, hash: null }
        }
      } catch (error) {
        console.error("❌ Error subiendo imagen:", error)
        throw error
      }
    },
    [computeSha256FromArrayBuffer],
  )

  // Eliminar imagen del bucket
  

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
        showToast("La imagen debe ser menor a 5MB")
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
        const result = await subirImagenASupabase(
          uri,
          nombreArchivo,
          mimeType,
        )
        const publicUrl = (result as any).publicUrl
        const storagePath = (result as any).storagePath
        const hash = (result as any).hash || null
        console.log("✅ URL pública obtenida:", publicUrl)

        // NOTA: No eliminamos la imagen anterior aquí para evitar borrar
        // la imagen recién subida por error. La eliminación de la imagen
        // anterior se realiza únicamente al guardar los cambios.

        // Actualizar estados
        console.log("💾 Actualizando estados con URL:", publicUrl)
        setFotoPerfil(publicUrl)
        setImagenTemporal(publicUrl)
        setUploadedPath(storagePath)
        setUploadedHash(hash)
        console.log('[useEditarPerfil] Uploaded path/hash set ->', storagePath, hash)
        setFotoPerfilLocal(null)
        console.log("✅ Estados actualizados correctamente")
        } catch (error) {
        console.error("❌ Error en proceso de subida:", error)
        showToast("No se pudo subir la imagen")
      } finally {
        console.log("🏁 Finalizando proceso de subida")
        setSubiendoImagen(false)
      }
    } catch (error) {
      console.error("❌ Error seleccionando imagen:", error)
      showToast("No se pudo seleccionar la imagen")
      setFotoPerfilLocal(null)
    }
  }, [
    session?.user?.id,
    fotoPerfil,
    fotoPerfilOriginal,
    subirImagenASupabase,
  ])

  // Guardar cambios
  const handleGuardar = useCallback(async () => {
    if (!nombre.trim()) {
      showToast("El nombre no puede estar vacío")
      return
    }

    if (!session?.user?.id) {
      showToast("No hay sesión activa")
      return
    }

    setCargando(true)
    try {
      await update({
        nombre: nombre.trim(),
        avatar_url: fotoPerfil || undefined,
      })

      // Nota: no eliminamos aquí la imagen subida; la eliminación de
      // archivos temporales se realiza únicamente al cancelar para evitar
      // borrar por error la imagen recién subida. Dejar solo la actualización
      // del perfil y actualizar el estado local.
      console.log('[useEditarPerfil] Guardar: no se elimina ninguna imagen en este paso (solo al cancelar)')

      // Limpiar flags
      setImagenTemporal(null)
      setUploadedPath(null)
      setFotoPerfilOriginal(fotoPerfil)

      // Mostrar toast informativo y proceder con acciones
      showToast("Perfil actualizado correctamente")
      // Marcamos que el archivo subido debe preservarse (no borrar)
      keepUploadedOnSave.current = true
      refetch()
      router.back()
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      showToast(
        error instanceof Error ? error.message : "No se pudo actualizar el perfil",
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
  ])

  // Cancelar cambios
  const handleCancelar = useCallback(async () => {
    if (uploadedPath) {
      try {
        if (uploadedHash && fotoPerfilOriginal) {
          const origPath = getStoragePathFromUrl(fotoPerfilOriginal)
          const origPublicUrl = origPath ? (supabase.storage.from('UserData').getPublicUrl(origPath).data?.publicUrl || null) : null
          const origHash = await computeSha256FromUrl(origPublicUrl)
          if (!origHash || origHash !== uploadedHash) {
            console.log('[useEditarPerfil] cancelar: eliminación deshabilitada (no-op) para', uploadedPath)
          }
        } else {
          const currentPath = getStoragePathFromUrl(fotoPerfil)
          const originalPath = getStoragePathFromUrl(fotoPerfilOriginal)
          if (currentPath !== originalPath) {
            console.log('[useEditarPerfil] cancelar: eliminación deshabilitada (no-op) para', uploadedPath)
          }
        }
      } catch (error) {
        console.warn("Error eliminando imagen temporal al cancelar:", error)
      }
    }
    setFotoPerfilLocal(null)
    router.back()
  }, [uploadedPath, fotoPerfil, fotoPerfilOriginal, getStoragePathFromUrl])

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
