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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      dispute_emails: {
        Row: {
          created_at: string
          draft: string
          email_to: string
          id: string
          invoice: string
          recipient: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draft: string
          email_to: string
          id?: string
          invoice: string
          recipient: string
          user_id: string
        }
        Update: {
          created_at?: string
          draft?: string
          email_to?: string
          id?: string
          invoice?: string
          recipient?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          analysis_data: Json | null
          created_at: string
          deleted: boolean
          file_path: string | null
          file_type: string
          id: string
          pages: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          deleted?: boolean
          file_path?: string | null
          file_type: string
          id?: string
          pages?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          deleted?: boolean
          file_path?: string | null
          file_type?: string
          id?: string
          pages?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gumroad_purchases: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expires_at: string | null
          gumroad_order_id: string | null
          id: string
          plan_id: string
          product_id: string
          started_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          gumroad_order_id?: string | null
          id?: string
          plan_id: string
          product_id: string
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          gumroad_order_id?: string | null
          id?: string
          plan_id?: string
          product_id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_agreements: {
        Row: {
          agreement_text: string
          context: string
          created_at: string
          deleted: boolean
          disclosing_party: string
          id: string
          receiving_party: string
          title: string | null
          type: string
          user_id: string
        }
        Insert: {
          agreement_text: string
          context: string
          created_at?: string
          deleted?: boolean
          disclosing_party: string
          id?: string
          receiving_party: string
          title?: string | null
          type?: string
          user_id: string
        }
        Update: {
          agreement_text?: string
          context?: string
          created_at?: string
          deleted?: boolean
          disclosing_party?: string
          id?: string
          receiving_party?: string
          title?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_chat_histories: {
        Row: {
          chat: Json
          created_at: string
          id: string
          title: string | null
          user_id: string
        }
        Insert: {
          chat: Json
          created_at?: string
          id?: string
          title?: string | null
          user_id: string
        }
        Update: {
          chat?: Json
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      legal_jurisdiction_suggestions: {
        Row: {
          created_at: string
          id: string
          region: string
          suggestion: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          region: string
          suggestion: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          region?: string
          suggestion?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          expires_at: string
          id: string
          plan_id: string
          promo_code_id: string
          redeemed_at: string
          starts_at: string
          user_id: string
          validity_duration_days: number
        }
        Insert: {
          expires_at: string
          id?: string
          plan_id?: string
          promo_code_id: string
          redeemed_at?: string
          starts_at: string
          user_id: string
          validity_duration_days?: number
        }
        Update: {
          expires_at?: string
          id?: string
          plan_id?: string
          promo_code_id?: string
          redeemed_at?: string
          starts_at?: string
          user_id?: string
          validity_duration_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          current_usage: number
          expiry_date: string
          id: string
          max_usage: number
          status: string
          updated_at: string
          validity_duration_days: number
        }
        Insert: {
          code: string
          created_at?: string
          current_usage?: number
          expiry_date: string
          id?: string
          max_usage?: number
          status?: string
          updated_at?: string
          validity_duration_days?: number
        }
        Update: {
          code?: string
          created_at?: string
          current_usage?: number
          expiry_date?: string
          id?: string
          max_usage?: number
          status?: string
          updated_at?: string
          validity_duration_days?: number
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          month_year: string
          plan_id: string
          referral_count: number
          starts_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          month_year: string
          plan_id: string
          referral_count: number
          starts_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          month_year?: string
          plan_id?: string
          referral_count?: number
          starts_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          first_paid_purchase_at: string | null
          id: string
          referral_email: string
          referred_user_email: string | null
          referred_user_id: string
          referrer_user_id: string
          reward_granted: boolean
          reward_month_year: string | null
          reward_plan_id: string | null
        }
        Insert: {
          created_at?: string
          first_paid_purchase_at?: string | null
          id?: string
          referral_email: string
          referred_user_email?: string | null
          referred_user_id: string
          referrer_user_id: string
          reward_granted?: boolean
          reward_month_year?: string | null
          reward_plan_id?: string | null
        }
        Update: {
          created_at?: string
          first_paid_purchase_at?: string | null
          id?: string
          referral_email?: string
          referred_user_email?: string | null
          referred_user_id?: string
          referrer_user_id?: string
          reward_granted?: boolean
          reward_month_year?: string | null
          reward_plan_id?: string | null
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          expires_at: string | null
          gumroad_purchase_id: string | null
          id: string
          paused_referral_reward: Json | null
          plan_id: string
          started_at: string
          updated_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          gumroad_purchase_id?: string | null
          id?: string
          paused_referral_reward?: Json | null
          plan_id: string
          started_at?: string
          updated_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          gumroad_purchase_id?: string | null
          id?: string
          paused_referral_reward?: Json | null
          plan_id?: string
          started_at?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_gumroad_purchase_id_fkey"
            columns: ["gumroad_purchase_id"]
            isOneToOne: false
            referencedRelation: "gumroad_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_effective_user_plan: {
        Args: { user_uuid: string }
        Returns: {
          expires_at: string
          is_promo_code: boolean
          is_referral_reward: boolean
          plan_id: string
        }[]
      }
      get_user_document_usage: {
        Args: { end_date: string; start_date: string; user_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
