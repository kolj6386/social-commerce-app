export interface ComplianceCustomerPayload {
  id: number
  email?: string
  phone?: string
}

export interface CustomerDataRequestWebhook {
  shop_id: number
  shop_domain: string
  orders_requested: number[]
  customer: ComplianceCustomerPayload
  data_request: { id: number }
}

export interface CustomerRedactWebhook {
  shop_id: number
  shop_domain: string
  customer: ComplianceCustomerPayload
  orders_to_redact: number[]
}

export interface ShopRedactWebhook {
  shop_id: number
  shop_domain: string
}
