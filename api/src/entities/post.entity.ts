import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { TableNames } from './table-names'

@Entity({ name: TableNames.Posts })
export class Post {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number

  @Column({ name: 'ProductId' })
  productId: number

  @Column({ name: 'UserId' })
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
