import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Localization from "expo-localization"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"

const resources = {
  es: {
    translation: {
      settings: "Configuraciones",
      notifications: "Notificaciones",
      language: "Idioma",
      chooseYourPreferredLanguage: "Elige tu idioma preferido",
      theme: "Tema",
      backup: "Copia de seguridad",
      security: "Seguridad",
      themeLight: "Modo claro",
      themeDark: "Modo oscuro",
      backupAuto: "Respaldo automático",
      backupManual: "Respaldo manual",
      passwordAndAuth: "Contraseña y autenticación",
      ChangePassword: "Cambiar contraseña",
      ConfigurePasswordAndAuthentication:
        "Configurar contraseña y autenticación",
      TwoFactorAuth: "Autenticación de dos factores",
      Cancel: "Cancelar",
    },
  },
  en: {
    translation: {
      settings: "Settings",
      notifications: "Notifications",
      language: "Language",
      chooseYourPreferredLanguage: "Choose your preferred language",
      theme: "Theme",
      backup: "Backup",
      security: "Security",
      themeLight: "Light mode",
      themeDark: "Dark mode",
      backupAuto: "Automatic backup",
      backupManual: "Manual backup",
      passwordAndAuth: "Password and authentication",
      ChangePassword: "Change Password",
      ConfigurePasswordAndAuthentication:
        "Configure Password and Authentication",
      TwoFactorAuth: "Two-factor authentication",
      Cancel: "Cancel",
    },
  },
}

async function getInitialLanguage() {
  const stored = await AsyncStorage.getItem("appLanguage")
  if (stored) return stored
  return Localization.getLocales()[0]?.languageCode ?? "en"
}

export async function initI18n() {
  const lng = await getInitialLanguage()
  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  })
  return i18n
}

export async function changeLanguage(lng: string) {
  await i18n.changeLanguage(lng)
  await AsyncStorage.setItem("appLanguage", lng)
}

export default i18n
