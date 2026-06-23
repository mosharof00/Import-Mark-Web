import type { Database } from "@/types/database.types"

/**
 * App-level convenience aliases over the generated Supabase types.
 *
 * Re-export `database.types.ts` rather than editing it — that file is generated
 * by `npm run gen:types` and will be overwritten whenever the schema changes.
 */

// Generic helpers ------------------------------------------------------------

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

// Enum unions ----------------------------------------------------------------

export type UserRole = Enums<"user_role">
export type UserStatus = Enums<"user_status">
export type ProductStatus = Enums<"product_status">
export type ShipmentStatus = Enums<"shipment_status">
export type OrderStatus = Enums<"order_status">
export type DeliveryMethod = Enums<"delivery_method">
export type PaymentMode = Enums<"payment_mode">
export type PaymentGatewayStatus = Enums<"payment_gateway_status">
export type StockMovementType = Enums<"stock_movement_type">
export type StockRefType = Enums<"stock_ref_type">
export type NotificationType = Enums<"notification_type">

// Common row aliases ---------------------------------------------------------

export type Admin = Tables<"admins">
export type Manager = Tables<"managers">
export type Customer = Tables<"customers">
export type CustomerAddress = Tables<"customer_addresses">
export type PaymentGateway = Tables<"payment_gateways">
export type Supplier = Tables<"suppliers">
export type Category = Tables<"categories">
export type Brand = Tables<"brands">
export type Product = Tables<"products">
export type ImportShipment = Tables<"import_shipments">
export type ImportShipmentItem = Tables<"import_shipment_items">
export type Stock = Tables<"stock">
export type StockMovement = Tables<"stock_movements">
export type SalesOrder = Tables<"sales_orders">
export type OrderItem = Tables<"order_items">
export type OrderStatusHistory = Tables<"order_status_history">
export type Payment = Tables<"payments">
export type SupplierPayment = Tables<"supplier_payments">
export type Notification = Tables<"notifications">

// View aliases ---------------------------------------------------------------

export type CustomerLedger = Views<"customer_ledger">
export type SupplierLedger = Views<"supplier_ledger">
export type ProductProfitability = Views<"product_profitability">
export type LowStockAlert = Views<"low_stock_alerts">
