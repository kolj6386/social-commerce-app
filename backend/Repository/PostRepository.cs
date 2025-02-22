using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.Reaction.Post;
using backend.Helpers;
using backend.Interfaces;
using backend.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class PostRepository : IPostRepository
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<PostRepository> _logger;
        public PostRepository(ApplicationDBContext context, ILogger<PostRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PostView?> AddPostView(IncrementViewQueryObject queryObject, string ipAddress)
        {
            // Need the IP address to count a view
            if (ipAddress == null) {
                return null;
            }

            // Check if this user already added a view and if they did return 
            var view = await _context.PostViews.FromSqlRaw(
                "SELECT * FROM PostViews WHERE PostId = @PostId AND UserID = @UserId AND ViewedAt > DATEADD(HOUR, -12, GETDATE())",
                new SqlParameter("@PostId", queryObject.PostId),
                new SqlParameter("@UserId", queryObject.UserId)
            ).FirstOrDefaultAsync();


            // Means there is no record yet and to add in a view on the post and viewpost table
            if (view == null) {
                await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Posts SET PostViews = PostViews + 1 WHERE Id = @PostId",
                    new SqlParameter("@PostId", queryObject.PostId)
                );

                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO PostViews (PostId, UserId, IpAddress, ViewedAt) VALUES ({0}, {1}, {2}, {3})",
                    queryObject.PostId, queryObject.UserId, ipAddress, DateTime.Now
                );

                var insertedView = await _context.PostViews
                .FromSqlRaw(
                    "SELECT * FROM PostViews WHERE PostId = @PostId AND UserID = @UserId AND IpAddress = @IpAddress AND ViewedAt = @ViewedAt",
                    new SqlParameter("@PostId", queryObject.PostId),
                    new SqlParameter("@UserId", (object?)queryObject.UserId ?? DBNull.Value),
                    new SqlParameter("@IpAddress", ipAddress),
                    new SqlParameter("@ViewedAt", DateTime.Now)
                ).FirstOrDefaultAsync();

                if (insertedView == null) {
                    return null;
                }

                
                await _context.SaveChangesAsync();
                return insertedView;
            } else {
                return null;
            }
        }

        public async Task<bool> ApproveOrDissaprovePost(PostReviewQueryObject queryObject)
        {
            var post = await _context.Posts.FromSqlRaw("SELECT * FROM Posts WHERE Id = {0}", queryObject.PostId).FirstOrDefaultAsync();

            if (post == null) {
                return false;
            }

            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE Posts SET ApprovedPost = @ApprovedPost WHERE Id = @PostId",
                new SqlParameter("@ApprovedPost", queryObject.Approved),
                new SqlParameter("@PostId", queryObject.PostId)
            );

            return true;
        }

        public async Task<Post> CreatePost(Post postModel)
        {
            await _context.Posts.AddAsync(postModel);
            await _context.SaveChangesAsync();
            return postModel;
        }
        public async Task<Post?> DeletePost(DeletePostQueryObject queryObject)
        {
            // Check if the postId is owned by the userId before deleting
            var post = await _context.Posts.FromSqlRaw("SELECT * FROM Posts WHERE Id = {0}", queryObject.postId).FirstOrDefaultAsync();

            if (post == null || post.UserId != queryObject.userId) {
                return null;
            } 

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<List<PostWithReactionsAndCommentsDto>> GetAllAsync(ContentQueryObject queryObject)
        {
            var flatPosts = await _context.Database.SqlQueryRaw<PostWithCommentWithReactionsFlatDto>(
                @"
                SELECT 
                    p.Id AS PostId, 
                    p.UserId AS PostUserId,
                    p.FirstName, 
                    p.LastName, 
                    p.PostContent, 
                    p.PostCreated, 
                    p.PostViews, 
                    p.PostMedia,
                    
                    c.Id AS CommentId,
                    c.UserId AS CommentUserId,
                    c.Content AS CommentContent,
                    c.CreatedAt AS CommentCreated,
                    
                    STRING_AGG(pr.Type, ',') AS PostReactionType,  
                    STRING_AGG(cr.Type, ',') AS CommentReactionType

                FROM Posts p
                LEFT JOIN Comments c ON p.Id = c.PostId
                LEFT JOIN PostReactions pr ON p.Id = pr.PostId  
                LEFT JOIN CommentReactions cr ON c.Id = cr.CommentId

                WHERE
                (@ApprovedPosts = 1 AND p.ApprovedPost = 1)
                OR (@ApprovedPosts = 0 AND p.ApprovedPost = 0)

                GROUP BY 
                p.Id, p.UserId, p.FirstName, p.LastName, p.PostContent, 
                p.PostCreated, p.PostViews, p.PostMedia,
                c.Id, c.UserId, c.Content, c.CreatedAt

                ORDER BY p.PostCreated DESC
                OFFSET @PageNumber ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@ApprovedPosts", queryObject.ApprovedPosts),
                new SqlParameter("@PageNumber", (queryObject.PageNumber - 1) * queryObject.ResultsPerPage),
                new SqlParameter("@PageSize", queryObject.ResultsPerPage)
            ).ToListAsync();

            if (flatPosts == null) {
                return null;
            }

            var groupedPosts = flatPosts.GroupBy(p => p.PostId).Select(postGroup => new PostWithReactionsAndCommentsDto
            {
                Id = postGroup.Key,
                UserId = postGroup.First().PostUserId,
                FirstName = postGroup.First().FirstName,
                LastName = postGroup.First().LastName,
                PostContent = postGroup.First().PostContent,
                PostCreated = postGroup.First().PostCreated,
                PostViews = postGroup.First().PostViews,
                PostMedia = postGroup.First().PostMedia.Split(',').ToList(),

                Reactions = postGroup.First().PostReactionType?.Split(',').ToList() ?? new List<string>(),

                Comments = postGroup
                    .Where(p => p.CommentId.HasValue)
                    .GroupBy(c => c.CommentId)
                    .Select(commentGroup => new CommentDto
                    {
                        Id = commentGroup.Key.HasValue ? commentGroup.Key.Value : 0,
                        UserId = commentGroup.FirstOrDefault()?.CommentUserId ?? default(int),
                        Content = commentGroup.FirstOrDefault()?.CommentContent ?? string.Empty,
                        CreatedAt = commentGroup.FirstOrDefault()?.CommentCreated ?? DateTime.MinValue,
                        Reactions = commentGroup.First().CommentReactionType?.Split(',').ToList() ?? new List<string>()
                    })
                    .ToList()
            }).ToList();

            return groupedPosts;
        }

        public async Task<PostWithReactionsAndCommentsDto?> GetById(int id)
        {
            var flatPost = await _context.Database.SqlQueryRaw<SinglePostWithCommentWithReactionsFlatDto>(
                @"
                SELECT 
                    p.Id AS PostId, 
                    p.UserId AS PostUserId,
                    p.FirstName, 
                    p.LastName, 
                    p.PostContent, 
                    p.PostCreated, 
                    p.PostViews, 
                    p.PostMedia,
                    
                    c.Id AS CommentId,
                    c.UserId AS CommentUserId,
                    c.Content AS CommentContent,
                    c.CreatedAt AS CommentCreated,
                    
                    STRING_AGG(pr.Type, ',') AS PostReactionType,  
                    STRING_AGG(cr.Type, ',') AS CommentReactionType

                FROM Posts p
                LEFT JOIN Comments c ON p.Id = c.PostId
                LEFT JOIN PostReactions pr ON p.Id = pr.PostId  
                LEFT JOIN CommentReactions cr ON c.Id = cr.CommentId

                WHERE p.Id = @PostId

                GROUP BY 
                p.Id, p.UserId, p.FirstName, p.LastName, p.PostContent, 
                p.PostCreated, p.PostViews, p.PostMedia,
                c.Id, c.UserId, c.Content, c.CreatedAt",
                new SqlParameter("@PostId", id)
            ).ToListAsync();

            if (flatPost == null) {
                return null;
            }

            var post = flatPost.GroupBy(p => p.PostId).Select(postGroup => new PostWithReactionsAndCommentsDto
            {
                Id = postGroup.Key,
                UserId = postGroup.First().PostUserId,
                FirstName = postGroup.First().FirstName,
                LastName = postGroup.First().LastName,
                PostContent = postGroup.First().PostContent,
                PostCreated = postGroup.First().PostCreated,
                PostViews = postGroup.First().PostViews,
                PostMedia = postGroup.First().PostMedia.Split(',').ToList(),

                Reactions = postGroup.First().PostReactionType?.Split(',').ToList() ?? new List<string>(),

                Comments = postGroup
                    .Where(p => p.CommentId.HasValue)
                    .GroupBy(c => c.CommentId)
                    .Select(commentGroup => new CommentDto
                    {
                        Id = commentGroup.Key.HasValue ? commentGroup.Key.Value : 0,
                        UserId = commentGroup.FirstOrDefault()?.CommentUserId ?? default(int),
                        Content = commentGroup.FirstOrDefault()?.CommentContent ?? string.Empty,
                        CreatedAt = commentGroup.FirstOrDefault()?.CommentCreated ?? DateTime.MinValue,
                        Reactions = commentGroup.First().CommentReactionType?.Split(',').ToList() ?? new List<string>()
                    })
                    .ToList()
            }).ToList();

            return post.FirstOrDefault();
        }

        public async Task<List<UnnapprovedPostsDto?>> GetUnapprovedPosts(UnapprovedPostsQueryObject queryObject, string shopId)
        {
            var posts = await _context.Database.SqlQueryRaw<UnnapprovedPostsDto>(
                @"
                SELECT 
                    p.Id, 
                    p.FirstName, 
                    p.LastName, 
                    p.PostContent, 
                    p.PostCreated,
                    p.PostMedia

                FROM Posts p

                WHERE
                @ShopId = p.ShopId
                AND p.ApprovedPost = 0

                ORDER BY p.PostCreated DESC
                OFFSET @PageNumber ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@ShopId", shopId),
                new SqlParameter("@PageNumber", (queryObject.PageNumber - 1) * queryObject.ResultsPerPage),
                new SqlParameter("@PageSize", queryObject.ResultsPerPage)
            ).ToListAsync();

            if (posts == null) {
                return null;
            }

            return posts;
        }

        public async Task<Post?> UpdateAsync(Post content)
        {
            var existingStock = await _context.Posts.FirstOrDefaultAsync(x => x.Id == content.Id);

            if (existingStock == null) {
                return null;
            }

            // TODO: Link up the existing post with the new reaction
            // existingStock.Reactions = content.Reactions;

            await _context.SaveChangesAsync();
            return existingStock;

        }
    }
}