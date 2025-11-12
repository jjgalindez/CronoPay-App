import { Database } from "../database.types"
import { supabase } from "../supabase"

export type CategoriaRow = Database["public"]["Tables"]["categoria"]["Row"]
export type MetodoPagoRow = Database["public"]["Tables"]["metodo_pago"]["Row"]

export async function fetchCategorias(): Promise<CategoriaRow[]> {
  const { data, error } = await supabase
    .from("categoria")
    .select("*")
    .order("nombre", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchMetodosPago(): Promise<MetodoPagoRow[]> {
  const { data, error } = await supabase
    .from("metodo_pago")
    .select("*")
    .order("tipo", { ascending: true })

  if (error) throw error
  return data ?? []
}
