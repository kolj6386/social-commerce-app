/** PascalCase table names — PostgreSQL requires quoted identifiers to preserve casing. */
export const TableNames = {
  Shops: 'Shops',
  Posts: 'Posts',
  Comments: 'Comments',
  PostReactions: 'PostReactions',
  CommentReactions: 'CommentReactions',
  PostViews: 'PostViews',
} as const
