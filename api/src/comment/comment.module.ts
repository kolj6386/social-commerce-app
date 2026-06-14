import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PostModule } from '../post/post.module'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'

@Module({
  imports: [DatabaseModule, PostModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
