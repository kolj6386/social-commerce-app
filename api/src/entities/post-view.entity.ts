import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { TableNames } from './table-names'

@Entity({ name: TableNames.PostViews })
export class PostView {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number

  @Column({ name: 'PostId' })
  postId: number

  /** Shopify customer id — must be bigint (null for guests). */
  @Column({ name: 'UserId', type: 'bigint', nullable: true })
  userId: number | null

  @Column({ name: 'IpAddress' })
  ipAddress: string

  @Column({ name: 'ViewedAt', type: 'timestamp' })
  viewedAt: Date
}
