// src/components/profile/ConfigurationList.tsx
import React, { useState } from "react"
import { View, Text, Alert } from "react-native"
import { ConfigurationItem } from "./ConfigurationItem"

export function ConfigurationList() {
  const [notificaciones, setNotificaciones] = useState(true)
  const [idioma, setIdioma] = useState("Español")
  const [tema, setTema] = useState("Modo claro")
  const [backup, setBackup] = useState("Respaldo automático")

  const handleNotificacionesPress = () => {
    setNotificaciones(!notificaciones)
  }

  const handleIdiomaPress = () => {
    Alert.alert(
      "Seleccionar Idioma",
      "Elige tu idioma preferido",
      [
        { text: "Español", onPress: () => setIdioma("Español") },
        { text: "English", onPress: () => setIdioma("English") },
        { text: "Português", onPress: () => setIdioma("Português") },
        { text: "Cancelar", style: "cancel" },
      ]
    )
  }

  const handleTemaPress = () => {
    Alert.alert(
      "Seleccionar Tema",
      "Elige tu tema preferido",
      [
        { text: "Modo claro", onPress: () => setTema("Modo claro") },
        { text: "Modo oscuro", onPress: () => setTema("Modo oscuro") },
        { text: "Automático", onPress: () => setTema("Automático") },
        { text: "Cancelar", style: "cancel" },
      ]
    )
  }

  const handleBackupPress = () => {
    Alert.alert(
      "Copia de Seguridad",
      "Configurar respaldo automático",
      [
        { text: "Respaldo automático", onPress: () => setBackup("Respaldo automático") },
        { text: "Respaldo manual", onPress: () => setBackup("Respaldo manual") },
        { text: "Cancelar", style: "cancel" },
      ]
    )
  }

  const handleSeguridadPress = () => {
    Alert.alert(
      "Seguridad",
      "Configurar contraseña y autenticación",
      [
        { text: "Cambiar contraseña", onPress: () => console.log("Cambiar contraseña") },
        { text: "Autenticación de dos factores", onPress: () => console.log("2FA") },
        { text: "Cancelar", style: "cancel" },
      ]
    )
  }

  const configItems = [
    {
      title: "Notificaciones",
      subtitle: "Recordatorios de pagos",
      hasSwitch: true,
      switchValue: notificaciones,
      onSwitchChange: setNotificaciones,
      onPress: handleNotificacionesPress,
    },
    {
      title: "Idioma",
      subtitle: idioma,
      onPress: handleIdiomaPress,
    },
    {
      title: "Tema",
      subtitle: tema,
      onPress: handleTemaPress,
    },
    {
      title: "Copia de seguridad",
      subtitle: backup,
      onPress: handleBackupPress,
    },
    {
      title: "Seguridad",
      subtitle: "Contraseña y autenticación",
      onPress: handleSeguridadPress,
    },
  ]

  return (
    <View className="bg-white">
      <Text className="text-lg font-semibold text-gray-900 px-6 py-4 bg-gray-50">
        Configuraciones
      </Text>
      
      <View className="bg-white">
        {configItems.map((item, index) => (
          <ConfigurationItem
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            hasSwitch={item.hasSwitch}
            switchValue={item.switchValue}
            onSwitchChange={item.onSwitchChange}
            onPress={item.onPress}
            isLast={index === configItems.length - 1}
          />
        ))}
      </View>
    </View>
  )
}