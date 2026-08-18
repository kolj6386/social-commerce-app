import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Shop } from '../entities/shop.entity'
import { CorsOriginsService } from './cors-origins.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  providers: [CorsOriginsService],
  exports: [CorsOriginsService],
})
export class CorsModule {}
