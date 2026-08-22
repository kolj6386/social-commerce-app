import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'

/** Shop domain from verified App Bridge session token (`dest` claim). */
export const AdminShop = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<Request & { shopifyAdmin?: Record<string, unknown> }>()
  const dest = request.shopifyAdmin?.dest

  if (typeof dest !== 'string') {
    throw new UnauthorizedException('Missing shop on session token')
  }

  try {
    const host = new URL(dest).hostname
    if (!host.endsWith('.myshopify.com')) {
      throw new UnauthorizedException('Invalid shop on session token')
    }
    return host
  } catch {
    throw new UnauthorizedException('Invalid shop on session token')
  }
})
