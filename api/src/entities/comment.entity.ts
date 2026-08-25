import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { TableNames } from './table-names'

@Entity({ name: TableNames.Comments })
export class Comment {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number

  /** Shopify customer id — must be bigint. */
  @Column({ name: 'UserId', type: 'bigint' })
  userId: number

  @Column({ name: 'PostId' })
  postId: number

  @Column({ name: 'FirstName', default: '' })
  firstName: string

  @Column({ name: 'LastName', default: '' })
  lastName: string

  @Column({ name: 'Content' })
  content: string

  @Column({ name: 'CreatedAt', type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'ShopId', default: '' })
  shopId: string

  @Column({ name: 'ApprovedComment' })
  approvedComment: boolean
}
