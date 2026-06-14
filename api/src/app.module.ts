import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminModule } from './admin/admin.module'
import { AuthModule } from './auth/auth.module'
import configuration from './config/configuration'
import { DatabaseModule } from './database/database.module'
import { CommentModule } from './comment/comment.module'
import { PostModule } from './post/post.module'
import { ReactionModule } from './reaction/reaction.module'
import { StorefrontModule } from './storefront/storefront.module'

// Handles loading config from .env and allowing access to DB
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    PostModule,
    CommentModule,
    ReactionModule,
    AdminModule,
    AuthModule,
    StorefrontModule,
  ],
})
export class AppModule {}
