/** PascalCase table names — PostgreSQL requires quoted identifiers to preserve casing. */
export const TableNames = {
  Posts: 'Posts',
  Comments: 'Comments',
  PostReactions: 'PostReactions',
  CommentReactions: 'CommentReactions',
  PostViews: 'PostViews',
} as const
