import AsyncStorage from "@react-native-async-storage/async-storage"
import { useColorScheme } from "nativewind"
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { useColorScheme as useSystemColorScheme } from "react-native"

type Tema = "light" | "dark"

interface ThemeContextType {
  tema: Tema
  toggleTema: () => void
  setTema: (nuevoTema: Tema) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "@app_tema"

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useSystemColorScheme()
  const { setColorScheme } = useColorScheme()

  const [tema, setTemaState] = useState<Tema>(
    systemScheme === "dark" ? "dark" : "light",
  )

  // Cargar tema guardado
  useEffect(() => {
    ; (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY)
        if (saved === "light" || saved === "dark") {
          setTemaState(saved)
        }
      } catch (error) {
        console.error("Error al cargar el tema:", error)
      }
    })()
  }, [])

  // Guardar tema y sincronizar con NativeWind
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, tema).catch((error) =>
      console.error("Error guardando el tema:", error),
    )

    // Usar NativeWind setColorScheme para actualizar todos los dark: variants
    if (setColorScheme) {
      setColorScheme(tema)
    }
  }, [tema, setColorScheme])

  const toggleTema = () =>
    setTemaState((prev) => (prev === "light" ? "dark" : "light"))

  const setTema = (nuevoTema: Tema) => {
    setTemaState(nuevoTema)
  }

  return (
    <ThemeContext.Provider value={{ tema, toggleTema, setTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook para acceder al tema
export const useTema = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTema debe usarse dentro de un ThemeProvider")
  }
  return context
}
