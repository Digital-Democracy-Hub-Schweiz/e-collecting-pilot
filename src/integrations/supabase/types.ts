export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      credentials: {
        Row: {
          credential_id: string | null
          einwohner_id: string
          id: string
          issued_at: string
          issued_by: string | null
          management_id: string | null
          offer_deeplink: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: string
          volksbegehren_id: string
        }
        Insert: {
          credential_id?: string | null
          einwohner_id: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          management_id?: string | null
          offer_deeplink?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          volksbegehren_id: string
        }
        Update: {
          credential_id?: string | null
          einwohner_id?: string
          id?: string
          issued_at?: string
          issued_by?: string | null
          management_id?: string | null
          offer_deeplink?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          volksbegehren_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credentials_einwohner_id_fkey"
            columns: ["einwohner_id"]
            isOneToOne: false
            referencedRelation: "einwohner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_volksbegehren_id_fkey"
            columns: ["volksbegehren_id"]
            isOneToOne: false
            referencedRelation: "volksbegehren"
            referencedColumns: ["id"]
          },
        ]
      }
      einwohner: {
        Row: {
          created_at: string
          geburtsdatum: string
          gemeinde_id: string
          id: string
          nachname: string
          updated_at: string
          vorname: string
        }
        Insert: {
          created_at?: string
          geburtsdatum: string
          gemeinde_id: string
          id?: string
          nachname: string
          updated_at?: string
          vorname: string
        }
        Update: {
          created_at?: string
          geburtsdatum?: string
          gemeinde_id?: string
          id?: string
          nachname?: string
          updated_at?: string
          vorname?: string
        }
        Relationships: [
          {
            foreignKeyName: "einwohner_gemeinde_id_fkey"
            columns: ["gemeinde_id"]
            isOneToOne: false
            referencedRelation: "gemeinden"
            referencedColumns: ["id"]
          },
        ]
      }
      gemeinde_admins: {
        Row: {
          created_at: string
          gemeinde_id: string
          id: string
          invited_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          gemeinde_id: string
          id?: string
          invited_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          gemeinde_id?: string
          id?: string
          invited_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gemeinde_admins_gemeinde_id_fkey"
            columns: ["gemeinde_id"]
            isOneToOne: false
            referencedRelation: "gemeinden"
            referencedColumns: ["id"]
          },
        ]
      }
      gemeinden: {
        Row: {
          bfs_nummer: string | null
          created_at: string
          created_by: string
          id: string
          kanton: string | null
          name: string
          updated_at: string
        }
        Insert: {
          bfs_nummer?: string | null
          created_at?: string
          created_by: string
          id?: string
          kanton?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          bfs_nummer?: string | null
          created_at?: string
          created_by?: string
          id?: string
          kanton?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volksbegehren: {
        Row: {
          comitee: string | null
          created_at: string
          description_de: string | null
          description_en: string | null
          description_fr: string | null
          description_it: string | null
          description_rm: string | null
          id: string
          level: string
          sign_date: string | null
          slug: string
          status: string | null
          title_de: string
          title_en: string | null
          title_fr: string | null
          title_it: string | null
          title_rm: string | null
          type: string
          updated_at: string
        }
        Insert: {
          comitee?: string | null
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_it?: string | null
          description_rm?: string | null
          id?: string
          level: string
          sign_date?: string | null
          slug: string
          status?: string | null
          title_de: string
          title_en?: string | null
          title_fr?: string | null
          title_it?: string | null
          title_rm?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          comitee?: string | null
          created_at?: string
          description_de?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_it?: string | null
          description_rm?: string | null
          id?: string
          level?: string
          sign_date?: string | null
          slug?: string
          status?: string | null
          title_de?: string
          title_en?: string | null
          title_fr?: string | null
          title_it?: string | null
          title_rm?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gemeinde_admin: {
        Args: { _gemeinde_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
