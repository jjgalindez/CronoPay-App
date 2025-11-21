// src/components/profile/ConfigurationList.tsx

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { View, Text, Alert } from "react-native"

import { ConfigurationItem } from "./ConfigurationItem"

import i18n, { changeLanguage } from "@/i18n"

export function ConfigurationList() {
  const { t } = useTranslation()

  const [notificaciones, setNotificaciones] = useState(true)
  const [tema, setTema] = useState("Modo claro")
  const [backup, setBackup] = useState("Respaldo automático")

  const handleNotificacionesPress = () => setNotificaciones(!notificaciones)

  const handleIdiomaPress = () => {
    Alert.alert(t("language"), t("Elige tu idioma preferido"), [
      { text: "Español", onPress: () => changeLanguage("es") },
      { text: "English", onPress: () => changeLanguage("en") },
      { text: "Português", onPress: () => changeLanguage("pt") },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const handleTemaPress = () => {
    Alert.alert(t("theme"), t("Elige tu tema preferido"), [
      { text: "Modo claro", onPress: () => setTema("Modo claro") },
      { text: "Modo oscuro", onPress: () => setTema("Modo oscuro") },
      { text: "Automático", onPress: () => setTema("Automático") },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const handleBackupPress = () => {
    Alert.alert(t("backup"), t("Configurar respaldo automático"), [
      {
        text: "Respaldo automático",
        onPress: () => setBackup("Respaldo automático"),
      },
      { text: "Respaldo manual", onPress: () => setBackup("Respaldo manual") },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const handleSeguridadPress = () => {
    Alert.alert(t("security"), t("Configurar contraseña y autenticación"), [
      {
        text: t("Cambiar contraseña"),
        onPress: () => console.log("Cambiar contraseña"),
      },
      {
        text: t("Autenticación de dos factores"),
        onPress: () => console.log("2FA"),
      },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const configItems = [
    {
      itemKey: "notifications" as const,
      title: t("notifications"),
      subtitle: t("Recordatorios de pagos"),
      hasSwitch: true,
      switchValue: notificaciones,
      onSwitchChange: setNotificaciones,
      onPress: handleNotificacionesPress,
    },
    {
      itemKey: "language" as const,
      title: t("language"),
      subtitle:
        i18n.language === "es"
          ? "Español"
          : i18n.language === "en"
            ? "English"
            : i18n.language === "pt"
              ? "Português"
              : i18n.language,
      onPress: handleIdiomaPress,
    },
    {
      itemKey: "theme" as const,
      title: t("theme"),
      subtitle: tema,
      onPress: handleTemaPress,
    },
    {
      itemKey: "backup" as const,
      title: t("backup"),
      subtitle: backup,
      onPress: handleBackupPress,
    },
    {
      itemKey: "security" as const,
      title: t("security"),
      subtitle: t("Contraseña y autenticación"),
      onPress: handleSeguridadPress,
    },
  ]

  return (
    <View className="bg-white">
      <Text className="bg-gray-50 px-6 py-4 text-lg font-semibold text-gray-900">
        {t("settings")}
      </Text>

      <View className="bg-white">
        {configItems.map((item, index) => (
          <ConfigurationItem
            key={item.itemKey}
            itemKey={item.itemKey}
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
