/**
 * Nombres de meses en español
 */
export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

/**
 * Nombres cortos de meses en español
 */
export const MONTH_NAMES_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

/**
 * Obtiene el nombre del mes dado su índice (0-11)
 */
export function getMonthName(month: number, short: boolean = false): string {
  const months = short ? MONTH_NAMES_SHORT : MONTH_NAMES
  return months[month] || ""
}

/**
 * Calcula el número de días hasta una fecha
 */
export function getDaysUntil(date: Date | string): number {
  const targetDate = typeof date === "string" ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)
  
  const diffInMs = targetDate.getTime() - today.getTime()
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24))
}

/**
 * Verifica si una fecha está vencida
 */
export function isOverdue(date: Date | string): boolean {
  return getDaysUntil(date) < 0
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date | string): boolean {
  return getDaysUntil(date) === 0
}

/**
 * Obtiene el rango de fechas para un mes específico
 */
export function getMonthRange(month: number, year: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

/**
 * Obtiene el mes anterior
 */
export function getPreviousMonth(month: number, year: number): { month: number; year: number } {
  if (month === 0) {
    return { month: 11, year: year - 1 }
  }
  return { month: month - 1, year }
}

/**
 * Obtiene el mes siguiente
 */
export function getNextMonth(month: number, year: number): { month: number; year: number } {
  if (month === 11) {
    return { month: 0, year: year + 1 }
  }
  return { month: month + 1, year }
}

/**
 * Filtra elementos por mes y año
 */
export function filterByMonth<T extends { fecha_vencimiento: string }>(
  items: T[],
  month: number,
  year: number
): T[] {
  return items.filter((item) => {
    const date = new Date(item.fecha_vencimiento)
    return date.getMonth() === month && date.getFullYear() === year
  })
}
