import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ORDER_STATUS_CONFIG,
  PRODUCT_STATUS_CONFIG,
  USER_STATUS_CONFIG,
  SHIPMENT_STATUS_CONFIG,
  GATEWAY_STATUS_CONFIG,
} from "@/lib/constants"
import type {
  OrderStatus,
  ProductStatus,
  ShipmentStatus,
  UserStatus,
  PaymentGatewayStatus,
} from "@/types"

/**
 * Renders a colored badge for any of the DB status enums. Pass the matching
 * `kind` so the right label/color map is used, e.g.
 *   <StatusBadge kind="order" value={order.status} />
 */
type StatusBadgeProps =
  | { kind: "order"; value: OrderStatus }
  | { kind: "product"; value: ProductStatus }
  | { kind: "user"; value: UserStatus }
  | { kind: "shipment"; value: ShipmentStatus }
  | { kind: "gateway"; value: PaymentGatewayStatus }

export function StatusBadge(props: StatusBadgeProps) {
  const config =
    props.kind === "order"
      ? ORDER_STATUS_CONFIG[props.value]
      : props.kind === "product"
        ? PRODUCT_STATUS_CONFIG[props.value]
        : props.kind === "user"
          ? USER_STATUS_CONFIG[props.value]
          : props.kind === "gateway"
            ? GATEWAY_STATUS_CONFIG[props.value]
            : SHIPMENT_STATUS_CONFIG[props.value]

  return (
    <Badge variant="secondary" className={cn("border-0", config.className)}>
      {config.label}
    </Badge>
  )
}
