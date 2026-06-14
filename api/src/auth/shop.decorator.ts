import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

export type ShopifyProxyRequest = Request & { shopifyShop?: string }

export const Shop = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<ShopifyProxyRequest>()
  return request.shopifyShop ?? ''
})
