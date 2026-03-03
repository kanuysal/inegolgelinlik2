/**
 * RE:GALIA Database Types
 * =======================
 * Auto-generated style types for Supabase.
 * These types enforce compile-time safety across all database queries.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type UserRole = 'user' | 'moderator' | 'admin'
export type ListingStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'sold' | 'archived'
export type ListingCondition = 'new_unworn' | 'excellent' | 'good'
export type ListingType = 'peer_to_peer' | 'sample_sale' | 'brand_direct'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded'
export type ClaimStatus = 'open' | 'under_review' | 'resolved' | 'dismissed'
export type NotificationType = 'listing_approved' | 'listing_rejected' | 'new_message' | 'order_update' | 'system'
export type ApprovalAction = 'approved' | 'rejected'
export type GownCategory = 'bridal' | 'evening' | 'accessories'
export type Silhouette = 'a_line' | 'ball_gown' | 'mermaid' | 'trumpet' | 'sheath' | 'fit_and_flare' | 'empire' | 'column'
export type TrainStyle = 'none' | 'sweep' | 'court' | 'chapel' | 'cathedral' | 'royal'

export interface Database {
  public: {
    Tables: {
      // =====================================================================
      // PROFILES — User profile data (extends Supabase auth.users)
      // =====================================================================
      profiles: {
        Row: {
          id: string
          display_name: string | null
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          treet_user_id: string | null
          google_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          treet_user_id?: string | null
          google_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          treet_user_id?: string | null
          google_id?: string | null
          updated_at?: string
        }
      }

      // =====================================================================
      // USER_ROLES — RBAC (Role-Based Access Control)
      // =====================================================================
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          granted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: UserRole
          granted_by?: string | null
          created_at?: string
        }
        Update: {
          role?: UserRole
          granted_by?: string | null
        }
      }

      // =====================================================================
      // PRODUCTS — Master Galia Lahav catalog (admin-managed)
      // =====================================================================
      products: {
        Row: {
          id: string
          style_name: string
          sku: string | null
          category: GownCategory
          silhouette: Silhouette | null
          train_style: TrainStyle | null
          msrp: number | null
          description: string | null
          images: string[]
          is_active: boolean
          stockist_id: number | null
          stockist_data: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          style_name: string
          sku?: string | null
          category: GownCategory
          silhouette?: Silhouette | null
          train_style?: TrainStyle | null
          msrp?: number | null
          description?: string | null
          images?: string[]
          is_active?: boolean
          stockist_id?: number | null
          stockist_data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          style_name?: string
          sku?: string | null
          category?: GownCategory
          silhouette?: Silhouette | null
          train_style?: TrainStyle | null
          msrp?: number | null
          description?: string | null
          images?: string[]
          is_active?: boolean
          stockist_id?: number | null
          stockist_data?: Record<string, any> | null
          updated_at?: string
        }
      }

      // =====================================================================
      // LISTINGS — User-submitted gowns for sale
      // =====================================================================
      listings: {
        Row: {
          id: string
          seller_id: string
          product_id: string | null
          title: string
          description: string | null
          category: GownCategory
          listing_type: ListingType
          condition: ListingCondition
          size_us: string | null
          bust_cm: number | null
          waist_cm: number | null
          hips_cm: number | null
          height_cm: number | null
          silhouette: Silhouette | null
          train_style: TrainStyle | null
          price: number
          msrp: number | null
          images: string[]
          status: ListingStatus
          rejection_reason: string | null
          treet_listing_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          product_id?: string | null
          title: string
          description?: string | null
          category: GownCategory
          listing_type?: ListingType
          condition: ListingCondition
          size_us?: string | null
          bust_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          height_cm?: number | null
          silhouette?: Silhouette | null
          train_style?: TrainStyle | null
          price: number
          msrp?: number | null
          images?: string[]
          status?: ListingStatus
          rejection_reason?: string | null
          treet_listing_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          product_id?: string | null
          title?: string
          description?: string | null
          category?: GownCategory
          listing_type?: ListingType
          condition?: ListingCondition
          size_us?: string | null
          bust_cm?: number | null
          waist_cm?: number | null
          hips_cm?: number | null
          height_cm?: number | null
          silhouette?: Silhouette | null
          train_style?: TrainStyle | null
          price?: number
          msrp?: number | null
          images?: string[]
          status?: ListingStatus
          rejection_reason?: string | null
          treet_listing_id?: string | null
          updated_at?: string
        }
      }

      // =====================================================================
      // ORDERS — Purchase transactions
      // =====================================================================
      orders: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          status: OrderStatus
          total: number
          commission_rate: number
          commission_amount: number
          seller_payout: number
          shipping_address: Json | null
          tracking_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          seller_id: string
          status?: OrderStatus
          total: number
          commission_rate?: number
          commission_amount: number
          seller_payout: number
          shipping_address?: Json | null
          tracking_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          shipping_address?: Json | null
          tracking_number?: string | null
          updated_at?: string
        }
      }

      // =====================================================================
      // CLAIMS — Dispute resolution
      // =====================================================================
      claims: {
        Row: {
          id: string
          order_id: string
          filed_by: string
          reason: string
          description: string | null
          evidence_urls: string[]
          status: ClaimStatus
          resolution_notes: string | null
          resolved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          filed_by: string
          reason: string
          description?: string | null
          evidence_urls?: string[]
          status?: ClaimStatus
          resolution_notes?: string | null
          resolved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: ClaimStatus
          resolution_notes?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
      }

      // =====================================================================
      // CONVERSATIONS — Chat threads between buyer and seller
      // =====================================================================
      conversations: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          seller_id: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          last_message_at?: string | null
        }
      }

      // =====================================================================
      // MESSAGES — Individual chat messages
      // =====================================================================
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }

      // =====================================================================
      // NOTIFICATIONS — User notifications
      // =====================================================================
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
        }
      }

      // =====================================================================
      // LISTING_APPROVAL_LOG — Admin audit trail
      // =====================================================================
      listing_approval_log: {
        Row: {
          id: string
          listing_id: string
          admin_id: string
          action: ApprovalAction
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          admin_id: string
          action: ApprovalAction
          reason?: string | null
          created_at?: string
        }
        Update: {}
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_moderator_or_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      listing_status: ListingStatus
      listing_condition: ListingCondition
      listing_type: ListingType
      order_status: OrderStatus
      claim_status: ClaimStatus
      notification_type: NotificationType
      approval_action: ApprovalAction
      gown_category: GownCategory
      silhouette: Silhouette
      train_style: TrainStyle
    }
  }
}

// Convenience types for components
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type ListingApprovalLog = Database['public']['Tables']['listing_approval_log']['Row']

// Join types (for queries with relations)
export type ListingWithSeller = Listing & { profiles: Profile }
export type ListingWithProduct = Listing & { products: Product | null }
export type ConversationWithParticipants = Conversation & {
  buyer: Profile
  seller: Profile
  listing: Listing
}
export type MessageWithSender = Message & { profiles: Profile }
