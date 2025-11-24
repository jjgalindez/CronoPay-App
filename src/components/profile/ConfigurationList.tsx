// src/components/profile/ConfigurationList.tsx

import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { View, Text, Alert } from "react-native"

import { ConfigurationItem } from "./ConfigurationItem"

import { useTema } from "@/hooks/useTema"
import i18n, { changeLanguage } from "@/i18n"

export function ConfigurationList() {
  const { tema, setTema, toggleTema } = useTema()

  const { t } = useTranslation()

  const [notificaciones, setNotificaciones] = useState(true)

  const [backup, setBackup] = useState<"backupAuto" | "backupManual">(
    "backupAuto",
  )

  const handleNotificacionesPress = () => setNotificaciones(!notificaciones)

  const handleIdiomaPress = () => {
    Alert.alert(t("language"), t("chooseYourPreferredLanguage"), [
      { text: "Español", onPress: () => changeLanguage("es") },
      { text: "English", onPress: () => changeLanguage("en") },
      { text: "Português", onPress: () => changeLanguage("pt") },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const handleTemaPress = () => {
    Alert.alert(t("theme"), t("Elige tu tema preferido"), [
      { text: "Modo claro", onPress: () => setTema("light") },
      { text: "Modo oscuro", onPress: () => setTema("dark") },
      { text: "Automático", onPress: () => toggleTema() },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const themeSubtitle = tema === "light" ? t("themeLight") : t("themeDark")

  const handleBackupPress = () => {
    Alert.alert(t("backup"), t("Configurar respaldo automático"), [
      {
        text: t("backupAuto"),
        onPress: () => setBackup("backupAuto"),
      },
      { text: t("backupManual"), onPress: () => setBackup("backupManual") },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const handleSeguridadPress = () => {
    Alert.alert(t("security"), t("ConfigurePasswordAndAuthentication"), [
      {
        text: t("ChangePassword"),
        onPress: () => console.log("ChangePassword"),
      },
      {
        text: t("TwoFactorAuth"),
        onPress: () => console.log("2FA"),
      },
      { text: t("Cancel"), style: "cancel" },
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
      subtitle: themeSubtitle,
      onPress: handleTemaPress,
    },
    {
      itemKey: "backup" as const,
      title: t("backup"),
      subtitle: t(backup),
      onPress: handleBackupPress,
    },
    {
      itemKey: "security" as const,
      title: t("security"),
      subtitle: t("passwordAndAuth"),
      onPress: handleSeguridadPress,
    },
  ]

  return (
    <View className="bg-white dark:bg-gray-900">
      <Text className="bg-gray-50 px-6  py-4 text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-100">
        {t("settings")}
      </Text>

      <View className="bg-white dark:bg-slate-900">
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
