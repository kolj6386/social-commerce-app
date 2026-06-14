import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'

export class ShopifyInstallQueryDto {
  @IsOptional()
  @IsString()
  hmac?: string

  @IsOptional()
  @IsString()
  host?: string

  @IsString()
  shop: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  timestamp?: number
}

export class ShopifyCallbackQueryDto {
  @IsString()
  code: string

  @IsOptional()
  @IsString()
  hmac?: string

  @IsString()
  host: string

  @IsString()
  shop: string

  @IsOptional()
  @IsString()
  state?: string

  @IsOptional()
  @IsString()
  session?: string

  @IsOptional()
  @IsString()
  locale?: string

  @IsOptional()
  @IsString()
  id_token?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  timestamp?: number
}
