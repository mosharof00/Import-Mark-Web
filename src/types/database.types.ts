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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          value: Json
          category: string
          label: string
          description: string | null
          value_type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          value: Json
          category: string
          label: string
          description?: string | null
          value_type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          value?: Json
          category?: string
          label?: string
          description?: string | null
          value_type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_currency: {
        Row: {
          id: boolean
          currency_code: string
          currency_name: string
          symbol: string
          country: string
          country_code: string
          flag: string
          locale: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: boolean
          currency_code?: string
          currency_name?: string
          symbol?: string
          country?: string
          country_code?: string
          flag?: string
          locale?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: boolean
          currency_code?: string
          currency_name?: string
          symbol?: string
          country?: string
          country_code?: string
          flag?: string
          locale?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          country_of_origin: string | null
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          website: string | null
        }
        Insert: {
          country_of_origin?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          website?: string | null
        }
        Update: {
          country_of_origin?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          area: string | null
          avatar_url: string | null
          city: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: string | null
          avatar_url?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          country: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          label: string
          postal_code: string | null
          recipient_name: string
          recipient_phone: string | null
          state_province: string | null
          updated_at: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          country: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          label: string
          postal_code?: string | null
          recipient_name: string
          recipient_phone?: string | null
          state_province?: string | null
          updated_at?: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          country?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          label?: string
          postal_code?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          state_province?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      import_shipment_items: {
        Row: {
          batch_number: string | null
          cost_per_unit_bdt: number | null
          cost_per_unit_foreign: number
          created_at: string
          expiry_date: string | null
          id: string
          notes: string | null
          product_id: string
          quantity_imported: number
          shipment_id: string
        }
        Insert: {
          batch_number?: string | null
          cost_per_unit_bdt?: number | null
          cost_per_unit_foreign: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity_imported: number
          shipment_id: string
        }
        Update: {
          batch_number?: string | null
          cost_per_unit_bdt?: number | null
          cost_per_unit_foreign?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity_imported?: number
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_shipment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_shipment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_profitability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "import_shipment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_shipment_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "import_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      import_shipments: {
        Row: {
          arrival_date: string | null
          bl_number: string | null
          clearance_date: string | null
          created_at: string
          created_by: string
          currency: string
          custom_duty: number
          document_urls: string[] | null
          exchange_rate: number
          freight_cost: number
          id: string
          invoice_number: string | null
          lc_number: string | null
          notes: string | null
          other_charges: number
          port_charges: number
          shipment_date: string | null
          shipment_ref: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          supplier_id: string
          total_invoice_bdt: number
          total_invoice_cost: number
          total_landed_cost: number | null
          updated_at: string
        }
        Insert: {
          arrival_date?: string | null
          bl_number?: string | null
          clearance_date?: string | null
          created_at?: string
          created_by: string
          currency?: string
          custom_duty?: number
          document_urls?: string[] | null
          exchange_rate?: number
          freight_cost?: number
          id?: string
          invoice_number?: string | null
          lc_number?: string | null
          notes?: string | null
          other_charges?: number
          port_charges?: number
          shipment_date?: string | null
          shipment_ref?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          supplier_id: string
          total_invoice_bdt?: number
          total_invoice_cost?: number
          total_landed_cost?: number | null
          updated_at?: string
        }
        Update: {
          arrival_date?: string | null
          bl_number?: string | null
          clearance_date?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          custom_duty?: number
          document_urls?: string[] | null
          exchange_rate?: number
          freight_cost?: number
          id?: string
          invoice_number?: string | null
          lc_number?: string | null
          notes?: string | null
          other_charges?: number
          port_charges?: number
          shipment_date?: string | null
          shipment_ref?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          supplier_id?: string
          total_invoice_bdt?: number
          total_invoice_cost?: number
          total_landed_cost?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_shipments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_ledger"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "import_shipments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "managers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          ref_id: string | null
          ref_table: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          ref_id?: string | null
          ref_table?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          ref_id?: string | null
          ref_table?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          discount: number
          id: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount?: number
          id?: string
          order_id: string
          product_id: string
          quantity: number
          subtotal?: number | null
          unit_price: number
        }
        Update: {
          created_at?: string
          discount?: number
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          subtotal?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_profitability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_at?: string
          changed_by: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          order_id: string
          payment_date: string
          payment_gateway_id: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          proof_image_url: string | null
          recorded_by: string
          reference_no: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          order_id: string
          payment_date?: string
          payment_gateway_id?: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          proof_image_url?: string | null
          recorded_by: string
          reference_no?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_date?: string
          payment_gateway_id?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          proof_image_url?: string | null
          recorded_by?: string
          reference_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_ledger"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_gateway_id_fkey"
            columns: ["payment_gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          account_name: string | null
          account_number: string | null
          bank_name: string | null
          branch_name: string | null
          created_at: string
          created_by: string | null
          id: string
          instructions: string | null
          name: string
          routing_number: string | null
          sort_order: number
          status: Database["public"]["Enums"]["payment_gateway_status"]
          type: Database["public"]["Enums"]["payment_mode"]
          updated_at: string
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          name: string
          routing_number?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["user_status"]
          type: Database["public"]["Enums"]["payment_mode"]
          updated_at?: string
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          bank_name?: string | null
          branch_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          name?: string
          routing_number?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["user_status"]
          type?: Database["public"]["Enums"]["payment_mode"]
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          brand_id: string | null
          category_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_urls: string[] | null
          last_import_id: string | null
          name: string
          origin_country: string | null
          rejection_note: string | null
          sell_price: number
          sku: string | null
          specifications: string | null
          status: Database["public"]["Enums"]["product_status"]
          unit: string
          unit_size: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          brand_id?: string | null
          category_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          last_import_id?: string | null
          name: string
          origin_country?: string | null
          rejection_note?: string | null
          sell_price: number
          sku?: string | null
          specifications?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          unit: string
          unit_size?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          brand_id?: string | null
          category_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          last_import_id?: string | null
          name?: string
          origin_country?: string | null
          rejection_note?: string | null
          sell_price?: number
          sku?: string | null
          specifications?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          unit?: string
          unit_size?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_last_import"
            columns: ["last_import_id"]
            isOneToOne: false
            referencedRelation: "import_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          address_id: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          customer_id: string
          delivered_at: string | null
          delivery_address: string | null
          delivery_image_url: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          discount_amount: number
          dispatched_at: string | null
          due_amount: number | null
          id: string
          notes: string | null
          order_number: string | null
          paid_amount: number
          payment_gateway_id: string | null
          payment_mode: Database["public"]["Enums"]["payment_mode"] | null
          payment_note: string | null
          rejection_note: string | null
          status: Database["public"]["Enums"]["order_status"]
          stock_reserved_at: string | null
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_image_url?: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          discount_amount?: number
          dispatched_at?: string | null
          due_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string | null
          paid_amount?: number
          payment_gateway_id?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_note?: string | null
          rejection_note?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stock_reserved_at?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_image_url?: string | null
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          discount_amount?: number
          dispatched_at?: string | null
          due_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string | null
          paid_amount?: number
          payment_gateway_id?: string | null
          payment_mode?: Database["public"]["Enums"]["payment_mode"] | null
          payment_note?: string | null
          rejection_note?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stock_reserved_at?: string | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_ledger"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_payment_gateway_id_fkey"
            columns: ["payment_gateway_id"]
            isOneToOne: false
            referencedRelation: "payment_gateways"
            referencedColumns: ["id"]
          },
        ]
      }
      stock: {
        Row: {
          id: string
          last_updated: string
          low_stock_threshold: number
          product_id: string
          quantity_available: number
        }
        Insert: {
          id?: string
          last_updated?: string
          low_stock_threshold?: number
          product_id: string
          quantity_available?: number
        }
        Update: {
          id?: string
          last_updated?: string
          low_stock_threshold?: number
          product_id?: string
          quantity_available?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product_profitability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          quantity_after: number
          quantity_before: number
          ref_id: string
          ref_type: Database["public"]["Enums"]["stock_ref_type"]
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          quantity_after: number
          quantity_before: number
          ref_id: string
          ref_type: Database["public"]["Enums"]["stock_ref_type"]
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          quantity_after?: number
          quantity_before?: number
          ref_id?: string
          ref_type?: Database["public"]["Enums"]["stock_ref_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_profitability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          amount_bdt: number | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          payment_date: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          recorded_by: string
          reference_no: string | null
          shipment_id: string | null
          supplier_id: string
        }
        Insert: {
          amount: number
          amount_bdt?: number | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          recorded_by: string
          reference_no?: string | null
          shipment_id?: string | null
          supplier_id: string
        }
        Update: {
          amount?: number
          amount_bdt?: number | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          recorded_by?: string
          reference_no?: string | null
          shipment_id?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "import_shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_ledger"
            referencedColumns: ["supplier_id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          country: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          country: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      customer_ledger: {
        Row: {
          company_name: string | null
          customer_id: string | null
          full_name: string | null
          phone: string | null
          total_billed: number | null
          total_due: number | null
          total_orders: number | null
          total_paid: number | null
        }
        Relationships: []
      }
      low_stock_alerts: {
        Row: {
          category: string | null
          id: string | null
          low_stock_threshold: number | null
          name: string | null
          quantity_available: number | null
        }
        Relationships: []
      }
      product_profitability: {
        Row: {
          avg_cost_per_unit_bdt: number | null
          brand: string | null
          category: string | null
          gross_margin_per_unit: number | null
          margin_percent: number | null
          name: string | null
          product_id: string | null
          sell_price: number | null
          stock_available: number | null
        }
        Relationships: []
      }
      supplier_ledger: {
        Row: {
          country: string | null
          name: string | null
          supplier_id: string | null
          total_due_bdt: number | null
          total_paid_bdt: number | null
          total_purchased_bdt: number | null
          total_shipments: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_role: { Args: never; Returns: string }
      auth_uid: { Args: never; Returns: string }
      reserve_order_stock: {
        Args: { p_actor_id: string; p_note?: string; p_order_id: string }
        Returns: undefined
      }
      restore_order_stock: {
        Args: { p_actor_id: string; p_note?: string; p_order_id: string }
        Returns: undefined
      }
    }
    Enums: {
      delivery_method: "own_team" | "customer_pickup"
      notification_type:
        | "order_pending_approval"
        | "order_approved"
        | "order_rejected"
        | "order_status_changed"
        | "low_stock"
        | "new_customer_registered"
        | "product_pending_approval"
        | "payment_recorded"
        | "shipment_arrived"
      order_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "processing"
        | "ready_for_pickup"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
        | "rejected"
      payment_mode:
        | "cash"
        | "bank_transfer"
        | "cheque"
        | "mobile_banking"
        | "other"
      payment_gateway_status: "active" | "inactive"
      product_status: "pending_approval" | "active" | "inactive" | "rejected"
      purchase_payment_status: "unpaid" | "partially_paid" | "paid"
      shipment_status:
        | "in_transit"
        | "arrived"
        | "customs_clearance"
        | "cleared"
        | "cancelled"
      stock_movement_type: "in" | "out" | "adjustment"
      stock_ref_type: "import" | "sale" | "manual_adjustment" | "return"
      user_role: "admin" | "manager" | "customer"
      user_status: "active" | "inactive" | "pending"
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
      delivery_method: ["own_team", "customer_pickup"],
      notification_type: [
        "order_pending_approval",
        "order_approved",
        "order_rejected",
        "order_status_changed",
        "low_stock",
        "new_customer_registered",
        "product_pending_approval",
        "payment_recorded",
        "shipment_arrived",
      ],
      order_status: [
        "draft",
        "pending_approval",
        "approved",
        "processing",
        "ready_for_pickup",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rejected",
      ],
      payment_mode: [
        "cash",
        "bank_transfer",
        "cheque",
        "mobile_banking",
        "other",
      ],
      payment_gateway_status: ["active", "inactive"],
      product_status: ["pending_approval", "active", "inactive", "rejected"],
      purchase_payment_status: ["unpaid", "partially_paid", "paid"],
      shipment_status: [
        "in_transit",
        "arrived",
        "customs_clearance",
        "cleared",
        "cancelled",
      ],
      stock_movement_type: ["in", "out", "adjustment"],
      stock_ref_type: ["import", "sale", "manual_adjustment", "return"],
      user_role: ["admin", "manager", "customer"],
      user_status: ["active", "inactive", "pending"],
    },
  },
} as const
