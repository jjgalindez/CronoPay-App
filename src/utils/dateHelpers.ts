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

import i18n from '../i18n'

/**
 * Obtiene el nombre del mes dado su índice (0-11)
 */
export function getMonthName(month: number, short: boolean = false): string {
  const months = getMonthNames(short)
  return months[month] || ""
}

/**
 * Devuelve el array completo de nombres de meses en español (o cortos)
 */
export function getMonthNames(short: boolean = false): string[] {
  try {
    const key = short ? 'monthNamesShort' : 'monthNames'
    const res = i18n.t(key, { returnObjects: true }) as unknown
    if (Array.isArray(res) && res.length > 0) return res as string[]
  } catch (e) {
    // ignore and fallback
  }
  return short ? MONTH_NAMES_SHORT.slice() : MONTH_NAMES.slice()
}

/**
 * Calcula el número de días hasta una fecha
 */
export function getDaysUntil(date: Date | string): number {
  const today = new Date()
  // If date is a string that includes time (ISO datetime), preserve time when parsing.
  let targetDate: Date
  if (typeof date === "string") {
    // detect presence of time (T separator or colon)
    const includesTime = date.includes("T") || date.match(/\d:\d/)
    targetDate = new Date(date)
    if (!includesTime) {
      // zero out time for day-based comparison
      targetDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
    }
  } else {
    targetDate = date
    // if a Date object was passed, preserve its time
  }

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
