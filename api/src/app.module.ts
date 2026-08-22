import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AdminModule } from './admin/admin.module'
import { AppUiModule } from './app/app-ui.module'
import { AuthModule } from './auth/auth.module'
import { CorsModule } from './cors/cors.module'
import configuration from './config/configuration'
import { DatabaseModule } from './database/database.module'
import { CommentModule } from './comment/comment.module'
import { HealthController } from './health/health.controller'
import { PostModule } from './post/post.module'
import { ReactionModule } from './reaction/reaction.module'
import { StorefrontModule } from './storefront/storefront.module'
import { WebhookModule } from './webhook/webhook.module'

// Handles loading config from .env and allowing access to DB
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    CorsModule,
    PostModule,
    CommentModule,
    ReactionModule,
    AdminModule,
    AppUiModule,
    AuthModule,
    StorefrontModule,
    WebhookModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
