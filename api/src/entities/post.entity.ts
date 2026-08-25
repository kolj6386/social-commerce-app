import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { TableNames } from './table-names'

@Entity({ name: TableNames.Posts })
export class Post {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number

  /** Shopify product id — must be bigint (exceeds Postgres integer). */
  @Column({ name: 'ProductId', type: 'bigint' })
  productId: number

  /** Shopify customer id (0 for guests) — must be bigint. */
  @Column({ name: 'UserId', type: 'bigint' })
  userId: number

  @Column({ name: 'FirstName' })
  firstName: string

  @Column({ name: 'LastName' })
  lastName: string

  @Column({ name: 'PostContent' })
  postContent: string

  @Column({ name: 'PostCreated', type: 'timestamp' })
  postCreated: Date

  @Column({ name: 'PostMedia', type: 'text' })
  postMedia: string

  @Column({ name: 'PostViews' })
  postViews: number

  @Column({ name: 'Shop' })
  shop: string

  @Column({ name: 'ApprovedPost' })
  approvedPost: boolean
}
