export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      finance_rates: {
        Row: {
          commission: number | null
          created_at: string | null
          id: string
          tax: number | null
        }
        Insert: {
          commission?: number | null
          created_at?: string | null
          id?: string
          tax?: number | null
        }
        Update: {
          commission?: number | null
          created_at?: string | null
          id?: string
          tax?: number | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity: number
          rate: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          account_name: string
          client_address: string | null
          client_email: string | null
          client_name: string
          created_at: string | null
          date: string
          due_date: string
          id: string
          invoice_number: string
          logo_url: string | null
          notes: string | null
          total_amount: number
        }
        Insert: {
          account_name: string
          client_address?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string | null
          date: string
          due_date: string
          id?: string
          invoice_number: string
          logo_url?: string | null
          notes?: string | null
          total_amount: number
        }
        Update: {
          account_name?: string
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          date?: string
          due_date?: string
          id?: string
          invoice_number?: string
          logo_url?: string | null
          notes?: string | null
          total_amount?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          currency: string | null
          debt_interest_rate: number | null
          debt_principal: number | null
          id: string
          image_url: string | null
          name: string
          phone: string | null
          show_all_accounts_analysis: boolean | null
          show_debt_feature: boolean | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          debt_interest_rate?: number | null
          debt_principal?: number | null
          id?: string
          image_url?: string | null
          name: string
          phone?: string | null
          show_all_accounts_analysis?: boolean | null
          show_debt_feature?: boolean | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          debt_interest_rate?: number | null
          debt_principal?: number | null
          id?: string
          image_url?: string | null
          name?: string
          phone?: string | null
          show_all_accounts_analysis?: boolean | null
          show_debt_feature?: boolean | null
        }
        Relationships: []
      }
      salary_entries: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: string
          name: string
          purpose: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          id?: string
          name: string
          purpose?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: string
          name?: string
          purpose?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_salary_entries_transaction"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          created_at: string | null
          date: string
          debt: number | null
          earnings: number | null
          id: string
          interest_rate: number | null
          investment: number | null
          salary: number | null
          spending: number | null
          to_be_credit: number | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          date: string
          debt?: number | null
          earnings?: number | null
          id?: string
          interest_rate?: number | null
          investment?: number | null
          salary?: number | null
          spending?: number | null
          to_be_credit?: number | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          date?: string
          debt?: number | null
          earnings?: number | null
          id?: string
          interest_rate?: number | null
          investment?: number | null
          salary?: number | null
          spending?: number | null
          to_be_credit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "fk_transactions_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_summary"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      account_summary: {
        Row: {
          account_id: string | null
          account_name: string | null
          is_active: boolean | null
          total_earnings: number | null
          total_investment: number | null
          total_salary: number | null
          total_spending: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      switch_account: {
        Args: { account_id: string }
        Returns: undefined
      }
      switch_to_account: {
        Args: { target_account_id: string }
        Returns: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
