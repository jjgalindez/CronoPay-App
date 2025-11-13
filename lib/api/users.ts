import { Database } from "../database.types"
import { supabase } from "../supabase"

export type UsuarioPerfilRow =
  Database["public"]["Tables"]["usuarios_perfil"]["Row"]
export type UsuarioPerfilInsert =
  Database["public"]["Tables"]["usuarios_perfil"]["Insert"]
export type UsuarioPerfilUpdate =
  Database["public"]["Tables"]["usuarios_perfil"]["Update"]

export async function fetchUsuarioPerfil(
  userId: string,
): Promise<UsuarioPerfilRow | null> {
  const { data, error } = await supabase
    .from("usuarios_perfil")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchUsuarioAvatar(
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("usuarios_perfil")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error
  return data?.avatar_url ?? null
}

export async function upsertUsuarioPerfil(
  payload: UsuarioPerfilInsert,
): Promise<UsuarioPerfilRow> {
  const { data, error } = await supabase
    .from("usuarios_perfil")
    .upsert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUsuarioPerfil(
  userId: string,
  values: UsuarioPerfilUpdate,
): Promise<UsuarioPerfilRow> {
  const { data, error } = await supabase
    .from("usuarios_perfil")
    .update(values)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}
