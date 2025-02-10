using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.Comment;
using backend.Dtos.Dtos.Reaction;
using backend.Dtos.Reaction.Post;
using backend.Helpers;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
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

                GROUP BY 
                p.Id, p.UserId, p.FirstName, p.LastName, p.PostContent, 
                p.PostCreated, p.PostViews, p.PostMedia,
                c.Id, c.UserId, c.Content, c.CreatedAt

                ORDER BY p.PostCreated DESC
                OFFSET @PageNumber ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@PageNumber", (queryObject.PageNumber - 1) * queryObject.ResultsPerPage),
                new SqlParameter("@PageSize", queryObject.ResultsPerPage)
            ).ToListAsync();

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

        public Task<PostWithReactionsAndCommentsDto?> GetById(int id)
        {
            throw new NotImplementedException();
        }


        // public async Task<PostWithReactionsAndCommentsDto?> GetById(int id)
        // {
        //     var post = await _context.Posts.FromSqlRaw("SELECT * FROM Posts WHERE Id = {0}", id).FirstOrDefaultAsync();

        //     if (post == null) {
        //         return null;
        //     }

        //     // Does not matter if this is null as there could be no reactions
        //     var reactions = await _context.Reactions
        //     .FromSqlRaw("SELECT * FROM REACTIONS WHERE PostId = {0}", id).ToListAsync();

        //     var comments = await _context.Comments.FromSqlRaw("SELECT * FROM Comments WHERE PostId = {0}", id).ToListAsync();

        //     return new PostWithReactionsAndCommentsDto {
        //         Id = post.Id,
        //         ProductId = post.ProductId,
        //         FirstName = post.FirstName,
        //         LastName = post.LastName,
        //         PostContent = post.PostContent,
        //         PostCreated = post.PostCreated,
        //         PostMedia = post.PostMedia,
        //         PostViews = post.PostViews,
        //         Reactions = reactions.Select(reaction => reaction.Type).ToList(),
        //         Comments = comments.Select(comment => new CommentDisplayDto {
        //             CommentId = comment.Id,
        //             CommentContent = comment.Content,
        //             CreatedAt = comment.CreatedAt
        //         }).ToList()
        //     };
        // }

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