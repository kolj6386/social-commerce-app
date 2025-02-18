using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Helpers;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class ReactionRepository : IReactionRepository
    {

        private IPostRepository _postRepo;
        private readonly ApplicationDBContext _context;

        public ReactionRepository(IPostRepository postRepo, ApplicationDBContext context)
        {
            _postRepo = postRepo;
            _context = context;
        }

        public async Task<bool> CreateReactionOnPostAsync(PostReaction reactionModel)
        {
            var postExists = await _context.Posts.AnyAsync(p => p.Id == reactionModel.PostId);
            if (!postExists)
            {
                return false;
            }

            // Check if the user has already reacted to this post
            var reactionExists = await _context.PostReactions
                .AnyAsync(r => r.PostId == reactionModel.PostId && r.UserId == reactionModel.UserId);
            
            if (reactionExists)
            {
                // Prevent multiple reactions from the same user on the same post
                return false;
            }
            
            try
            {
                // need to insert the reaction into our table 
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO PostReactions (UserId, PostId, Type) VALUES ({0}, {1}, {2})",
                    reactionModel.UserId, reactionModel.PostId, reactionModel.Type
                );
                await _context.SaveChangesAsync();
                return true;   
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error inserting reaction: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> CreateReactionOnCommentAsync(CommentReaction reactionCommentModel)
        {
            var commentExists = _context.Comments.AnyAsync(c => c.Id == reactionCommentModel.CommentId);

            if (commentExists == null) {
                return false;
            }

            // Check if the user has already reacted to this post, Prevent multiple reactions from the same user on the same post
            var reactionExistsOnComment = await _context.CommentReactions
                .AnyAsync(r => r.CommentId == reactionCommentModel.CommentId && r.UserId == reactionCommentModel.UserId);
            
            if (reactionExistsOnComment)
            {
                return false;
            }


            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO CommentReactions (UserId, CommentId, Type) VALUES ({0}, {1}, {2})",
                    reactionCommentModel.UserId, reactionCommentModel.CommentId, reactionCommentModel.Type
                );
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error inserting reaction: {ex.Message}");
                return false;
            }

        }

        public async Task<bool> DeleteReactionOnPostAsync(PostReaction reactionModel)
        {
            var postExists = await _context.Posts.AnyAsync(p => p.Id == reactionModel.PostId);
            if (!postExists)
            {
                return false;
            }

            // Check if the user has reacted to this post
            var reactionExists = await _context.PostReactions.AnyAsync(r => r.PostId == reactionModel.PostId && r.UserId == reactionModel.UserId);
            
            if (reactionExists)
            {
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM PostReactions WHERE PostId = @p0 AND UserId = @p1",
                        reactionModel.UserId, reactionModel.PostId
                    );
                    return true;   
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error inserting reaction: {ex.Message}");
                    return false;
                }

            } else {
                return false;
            }
        }

        public async Task<bool> DeleteReactionOnCommentAsync(CommentReaction reactionCommentModel)
        {
            var commentExists = await _context.Comments.AnyAsync(p => p.Id == reactionCommentModel.CommentId);
            if (!commentExists)
            {
                return false;
            }

            // Check if the user has reacted to this post
            var reactionExistsOnComment = await _context.CommentReactions.AnyAsync(r => r.CommentId == reactionCommentModel.CommentId && r.UserId == reactionCommentModel.UserId);
            
            if (reactionExistsOnComment)
            {
                try
                {
                    await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM CommentReactions WHERE CommentId = @p0 AND UserId = @p1",
                        reactionCommentModel.UserId, reactionCommentModel.CommentId
                    );
                    return true;   
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error inserting reaction: {ex.Message}");
                    return false;
                }

            } else {
                return false;
            }
        }
    }
}