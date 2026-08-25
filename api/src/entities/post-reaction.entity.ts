import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { TableNames } from './table-names'

@Entity({ name: TableNames.PostReactions })
@Unique('UQ_PostReactions_UserId_PostId', ['userId', 'postId'])
export class PostReaction {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number

  @Column({ name: 'PostId' })
  postId: number

  /** Shopify customer id — must be bigint. */
  @Column({ name: 'UserId', type: 'bigint' })
  userId: number

  @Column({ name: 'Type' })
  type: string
}
