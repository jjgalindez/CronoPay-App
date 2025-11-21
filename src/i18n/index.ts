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
            theme: "Tema",
            backup: "Copia de seguridad",
            security: "Seguridad",
        },
    },
    en: {
        translation: {
            settings: "Settings",
            notifications: "Notifications",
            language: "Language",
            theme: "Theme",
            backup: "Backup",
            security: "Security",
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
