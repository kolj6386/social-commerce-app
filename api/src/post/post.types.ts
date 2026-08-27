type PostReactionFields = 'postLoveCount' | 'postLikeCount' | 'postLaughCount' | 'postDislikeCount'
type CommentReactionFields =
  | 'commentLoveCount'
  | 'commentLikeCount'
  | 'commentLaughCount'
  | 'commentDislikeCount'

export interface PostFlatRow {
  PostId: number
  PostUserId: number
  FirstName: string
  LastName: string
  PostContent: string
  PostCreated: Date
  PostViews: number
  PostMedia: string
  CommentId: number | null
  CommentUserId: number | null
  CommentFirstName: string | null
  CommentLastName: string | null
  CommentContent: string | null
  CommentCreated: Date | null
  CommentLikeCount: number | null
  CommentDislikeCount: number | null
  CommentLaughCount: number | null
  CommentLoveCount: number | null
  PostLikeCount: number | null
  PostLoveCount: number | null
  PostLaughCount: number | null
  PostdislikeCount: number | null
}

export interface CommentDto {
  id: number
  userId: number
  firstName: string
  lastName: string
  content: string
  createdAt: Date
  reactions: Record<CommentReactionFields, number>
}

export interface PostWithReactionsAndCommentsDto {
  id: number
  userId: number
  firstName: string
  lastName: string
  postContent: string
  postCreated: Date
  postViews: number
  postMedia: string[]
  reactions: Record<PostReactionFields, number>
  comments: CommentDto[]
}

export interface UnapprovedPostDto {
  Id: number
  FirstName: string
  LastName: string
  PostContent: string
  PostCreated: Date
  PostMedia: string
}
