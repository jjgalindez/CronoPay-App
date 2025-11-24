import { Database } from "../database.types"
import { supabase } from "../supabase"

export type CategoriaRow = Database["public"]["Tables"]["categoria"]["Row"]
export type CategoriaInsert = Database["public"]["Tables"]["categoria"]["Insert"]
export type CategoriaUpdate = Database["public"]["Tables"]["categoria"]["Update"]

export type MetodoPagoRow = Database["public"]["Tables"]["metodo_pago"]["Row"]
export type MetodoPagoInsert = Database["public"]["Tables"]["metodo_pago"]["Insert"]
export type MetodoPagoUpdate = Database["public"]["Tables"]["metodo_pago"]["Update"]

// ==================== CATEGORIAS ====================

export async function fetchCategorias(): Promise<CategoriaRow[]> {
  const { data, error } = await supabase
    .from("categoria")
    .select("*")
    .order("nombre", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchCategoriaById(categoriaId: number): Promise<CategoriaRow | null> {
  const { data, error } = await supabase
    .from("categoria")
    .select("*")
    .eq("id_categoria", categoriaId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createCategoria(payload: CategoriaInsert): Promise<CategoriaRow> {
  const { data, error } = await supabase
    .from("categoria")
    .insert(payload)
    .select("*")
    .single()

  if (error) throw error
  return data
}

export async function updateCategoria(
  categoriaId: number,
  values: CategoriaUpdate
): Promise<CategoriaRow> {
  const { data, error } = await supabase
    .from("categoria")
    .update(values)
    .eq("id_categoria", categoriaId)
    .select("*")
    .single()

  if (error) throw error
  return data
}

export async function deleteCategoria(categoriaId: number): Promise<void> {
  const { error } = await supabase
    .from("categoria")
    .delete()
    .eq("id_categoria", categoriaId)

  if (error) throw error
}

// ==================== MÉTODOS DE PAGO ====================

export async function fetchMetodosPago(): Promise<MetodoPagoRow[]> {
  const { data, error } = await supabase
    .from("metodo_pago")
    .select("*")
    .order("tipo", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchMetodoPagoById(metodoId: number): Promise<MetodoPagoRow | null> {
  const { data, error } = await supabase
    .from("metodo_pago")
    .select("*")
    .eq("id_metodo", metodoId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createMetodoPago(payload: MetodoPagoInsert): Promise<MetodoPagoRow> {
  const { data, error } = await supabase
    .from("metodo_pago")
    .insert(payload)
    .select("*")
    .single()

  if (error) throw error
  return data
}

export async function updateMetodoPago(
  metodoId: number,
  values: MetodoPagoUpdate
): Promise<MetodoPagoRow> {
  const { data, error } = await supabase
    .from("metodo_pago")
    .update(values)
    .eq("id_metodo", metodoId)
    .select("*")
    .single()

  if (error) throw error
  return data
}

export async function deleteMetodoPago(metodoId: number): Promise<void> {
  const { error } = await supabase
    .from("metodo_pago")
    .delete()
    .eq("id_metodo", metodoId)

  if (error) throw error
}
