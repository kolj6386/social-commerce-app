import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { ReactionController } from './reaction.controller'
import { ReactionService } from './reaction.service'

@Module({
  imports: [DatabaseModule],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
