import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { TableNames } from './table-names'

@Entity({ name: TableNames.CommentReactions })
@Unique('UQ_CommentReactions_UserId_CommentId', ['userId', 'commentId'])
export class CommentReaction {
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number

  @Column({ name: 'CommentId' })
  commentId: number

  @Column({ name: 'UserId' })
  userId: number

  @Column({ name: 'Type' })
  type: string
}
