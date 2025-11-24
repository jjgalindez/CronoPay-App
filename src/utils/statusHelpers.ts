/**
 * Tipos de estado de pago
 */
export type PaymentStatus = "Pagado" | "Pendiente" | "Vencido"

/**
 * Mapeo de íconos por estado
 */
export const ICON_MAP: Record<PaymentStatus, string> = {
  Pagado: "checkmark-circle-outline",
  Pendiente: "time-outline",
  Vencido: "alert-circle-outline",
}

/**
 * Mapeo de colores por estado
 */
export const STATUS_COLOR_MAP: Record<PaymentStatus, string> = {
  Pagado: "#1AAE6F",
  Pendiente: "#FF6B00",
  Vencido: "#FF3B30",
}

/**
 * Mapeo de colores de fondo de íconos por estado
 */
export const STATUS_BACKGROUND_MAP: Record<PaymentStatus, string> = {
  Pagado: "#E8F9F1",
  Pendiente: "#FFF1E3",
  Vencido: "#FFEBEB",
}

/**
 * Obtiene el ícono correspondiente a un estado
 */
export function getStatusIcon(estado: PaymentStatus): string {
  return ICON_MAP[estado] || ICON_MAP["Pendiente"]
}

/**
 * Obtiene el color correspondiente a un estado
 */
export function getStatusColor(estado: PaymentStatus): string {
  return STATUS_COLOR_MAP[estado] || STATUS_COLOR_MAP["Pendiente"]
}

/**
 * Obtiene el color de fondo del ícono correspondiente a un estado
 */
export function getStatusBackground(estado: PaymentStatus): string {
  return STATUS_BACKGROUND_MAP[estado] || STATUS_BACKGROUND_MAP["Pendiente"]
}

/**
 * Obtiene todos los colores relacionados con un estado
 */
export function getStatusColors(estado: PaymentStatus, isDark: boolean = false): {
  iconColor: string
  iconBg: string
  textColor: string
} {
  // For now keep same palette but allow callers to pass `isDark` if they want to switch behavior later
  return {
    iconColor: getStatusColor(estado),
    iconBg: getStatusBackground(estado),
    textColor: getStatusColor(estado),
  }
}
