/**
 * Obtiene el ícono correspondiente a una categoría
 */
export function getCategoryIcon(categoria: string): string {
  const iconMap: Record<string, string> = {
    Suscripción: "tv-outline",
    Suscripciones: "tv-outline",
    Servicios: "flash-outline",
    Deudores: "people-outline",
    Transporte: "car-outline",
    Comida: "fast-food-outline",
    Vivienda: "home-outline",
    Salud: "medical-outline",
    Educación: "school-outline",
    Entretenimiento: "game-controller-outline",
    Otros: "ellipsis-horizontal-outline",
  }
  return iconMap[categoria] || "wallet-outline"
}

/**
 * Colores predefinidos para categorías
 */
export const CATEGORY_COLORS = [
  "#0F5B5C",
  "#12C48B",
  "#FFB020",
  "#7C4DFF",
  "#FF6B6B",
  "#3AA9FF",
]

/**
 * Obtiene un color de categoría basado en el índice
 */
export function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}
