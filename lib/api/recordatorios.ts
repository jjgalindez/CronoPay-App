import { supabase } from "../supabase"
import { Database } from "../database.types"

export type RecordatorioRow = Database["public"]["Tables"]["recordatorio"]["Row"]
export type RecordatorioInsert = Database["public"]["Tables"]["recordatorio"]["Insert"]
export type RecordatorioUpdate = Database["public"]["Tables"]["recordatorio"]["Update"]

// ==================== RECORDATORIOS ====================

/**
 * Obtener todos los recordatorios de un pago específico
 */
export async function fetchRecordatoriosByPago(
  pagoId: number
): Promise<RecordatorioRow[]> {
  const { data, error } = await supabase
    .from("recordatorio")
    .select("*")
    .eq("id_pago", pagoId)
    .order("fecha_aviso", { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Obtener un recordatorio por su ID
 */
export async function fetchRecordatorioById(
  recordatorioId: number
): Promise<RecordatorioRow | null> {
  const { data, error } = await supabase
    .from("recordatorio")
    .select("*")
    .eq("id_recordatorio", recordatorioId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Obtener recordatorios próximos (ej: en los próximos 7 días)
 */
export async function fetchRecordatoriosProximos(
  pagoId: number,
  diasAnticipacion: number = 7
): Promise<RecordatorioRow[]> {
  const hoy = new Date()
  const fechaLimite = new Date()
  fechaLimite.setDate(hoy.getDate() + diasAnticipacion)

  const { data, error } = await supabase
    .from("recordatorio")
    .select("*")
    .eq("id_pago", pagoId)
    .gte("fecha_aviso", hoy.toISOString().split("T")[0])
    .lte("fecha_aviso", fechaLimite.toISOString().split("T")[0])
    .order("fecha_aviso", { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Crear un nuevo recordatorio
 */
export async function createRecordatorio(
  payload: RecordatorioInsert
): Promise<RecordatorioRow> {
  const { data, error } = await supabase
    .from("recordatorio")
    .insert(payload)
    .select("*")
    .single()

  if (error) throw error
  return data
}

/**
 * Actualizar un recordatorio existente
 */
export async function updateRecordatorio(
  recordatorioId: number,
  values: RecordatorioUpdate
): Promise<RecordatorioRow> {
  const { data, error } = await supabase
    .from("recordatorio")
    .update(values)
    .eq("id_recordatorio", recordatorioId)
    .select("*")
    .single()

  if (error) throw error
  return data
}

/**
 * Eliminar un recordatorio
 */
export async function deleteRecordatorio(recordatorioId: number): Promise<void> {
  const { error } = await supabase
    .from("recordatorio")
    .delete()
    .eq("id_recordatorio", recordatorioId)

  if (error) throw error
}

/**
 * Eliminar todos los recordatorios de un pago
 */
export async function deleteRecordatoriosByPago(pagoId: number): Promise<void> {
  const { error } = await supabase
    .from("recordatorio")
    .delete()
    .eq("id_pago", pagoId)

  if (error) throw error
}
