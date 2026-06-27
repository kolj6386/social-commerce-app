import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from '../entities/comment.entity'
import { CommentReaction } from '../entities/comment-reaction.entity'
import { Post } from '../entities/post.entity'
import { PostReaction } from '../entities/post-reaction.entity'
import { PostView } from '../entities/post-view.entity'
import { PascalCaseNamingStrategy } from './pascal-case-naming.strategy'
import { Shop } from '../entities/shop.entity'

const entities = [Post, Comment, PostReaction, CommentReaction, PostView, Shop]

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const trustedConnection = config.get<boolean>('database.trustedConnection') === true
        const instanceName = config.get<string>('database.instance')
        const host = config.get<string>('database.host')
        const database = config.get<string>('database.database')
        const username = config.get<string>('database.username')
        const password = config.get<string>('database.password')
        const port = config.get<number>('database.port')
        const synchronize = config.get<boolean>('database.synchronize') === true

        const baseOptions = {
          synchronize,
          connectionTimeout: 15_000,
          namingStrategy: new PascalCaseNamingStrategy(),
        }

        if (trustedConnection) {
          return {
            type: 'postgres' as const,
            host,
            database,
            entities,
            ...baseOptions,
          }
        }

        const databaseUrl = config.get<string>('database.url')
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            entities,
            ...baseOptions,
          }
        }

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          entities,
          ...baseOptions,
        }
      },
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
