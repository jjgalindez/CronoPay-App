/**
 * Formatea un número como moneda en pesos dominicanos (DOP)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-DO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea un número como moneda con símbolo
 */
export function formatCurrencyWithSymbol(amount: number, currency: string = "DOP"): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea una fecha en formato legible
 */
export function formatDate(date: Date | string, format: "short" | "long" = "short"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  
  if (format === "short") {
    return dateObj.toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }
  
  return dateObj.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Formatea una fecha relativa (ej: "hace 2 días")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Hoy"
  if (diffInDays === 1) return "Ayer"
  if (diffInDays < 7) return `Hace ${diffInDays} días`
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`
  return `Hace ${Math.floor(diffInDays / 365)} años`
}
