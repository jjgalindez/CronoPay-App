export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios_perfil: {
        Row: {
          id: string
          nombre: string | null
          avatar_url: string
          creado_en: string | null
          email: string
        }
        Insert: {
          id: string
          nombre?: string | null
          avatar_url: string
          creado_en?: string | null
          email?: string
        }
        Update: {
          id?: string
          nombre?: string | null
          avatar_url?: string
          creado_en?: string | null
          email?: string
        }
        Relationships: []
      }
      categoria: {
        Row: {
          id_categoria: number
          nombre: string
          descripcion: string | null
        }
        Insert: {
          id_categoria?: number
          nombre: string
          descripcion?: string | null
        }
        Update: {
          id_categoria?: number
          nombre?: string
          descripcion?: string | null
        }
        Relationships: []
      }
      metodo_pago: {
        Row: {
          id_metodo: number
          tipo: string
          detalles: string | null
        }
        Insert: {
          id_metodo?: number
          tipo: string
          detalles?: string | null
        }
        Update: {
          id_metodo?: number
          tipo?: string
          detalles?: string | null
        }
        Relationships: []
      }
      pago: {
        Row: {
          id_pago: number
          monto: string
          fecha_vencimiento: string
          estado: string | null
          id_usuario: string
          id_categoria: number | null
          id_metodo: number | null
          created_at: string | null
          updated_at: string | null
          titulo: string
        }
        Insert: {
          id_pago?: number
          monto: string
          fecha_vencimiento: string
          estado?: string | null
          id_usuario: string
          id_categoria?: number | null
          id_metodo?: number | null
          created_at?: string | null
          updated_at?: string | null
          titulo: string
        }
        Update: {
          id_pago?: number
          monto?: string
          fecha_vencimiento?: string
          estado?: string | null
          id_usuario?: string
          id_categoria?: number | null
          id_metodo?: number | null
          created_at?: string | null
          updated_at?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pago_id_categoria_fkey"
            columns: ["id_categoria"]
            isOneToOne: false
            referencedRelation: "categoria"
            referencedColumns: ["id_categoria"]
          },
          {
            foreignKeyName: "pago_id_metodo_fkey"
            columns: ["id_metodo"]
            isOneToOne: false
            referencedRelation: "metodo_pago"
            referencedColumns: ["id_metodo"]
          },
          {
            foreignKeyName: "pago_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios_perfil"
            referencedColumns: ["id"]
          },
        ]
      }
      recordatorio: {
        Row: {
          id_recordatorio: number
          fecha_aviso: string
          mensaje: string | null
          id_pago: number
          created_at: string | null
        }
        Insert: {
          id_recordatorio?: number
          fecha_aviso: string
          mensaje?: string | null
          id_pago: number
          created_at?: string | null
        }
        Update: {
          id_recordatorio?: number
          fecha_aviso?: string
          mensaje?: string | null
          id_pago?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recordatorio_id_pago_fkey"
            columns: ["id_pago"]
            isOneToOne: false
            referencedRelation: "pago"
            referencedColumns: ["id_pago"]
          },
        ]
      }
      informe: {
        Row: {
          id_informe: number
          mes: number
          total_pagado: string | null
          total_pendiente: string | null
          id_usuario: string
          created_at: string | null
        }
        Insert: {
          id_informe?: number
          mes: number
          total_pagado?: string | null
          total_pendiente?: string | null
          id_usuario: string
          created_at?: string | null
        }
        Update: {
          id_informe?: number
          mes?: number
          total_pagado?: string | null
          total_pendiente?: string | null
          id_usuario?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "informe_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios_perfil"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: object
    Functions: object
    Enums: object
    CompositeTypes: object
  }
}
