using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos.Comment;
using backend.Helpers;
using backend.Interfaces;
using backend.Mappers;
using backend.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class CommentRepository : ICommentRepository
    {
        private readonly ApplicationDBContext _context;

        public CommentRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<Comment> CreateCommentOnPost(Comment comment)
        {
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment?> DeleteCommentAsync(DeleteCommentQueryObject queryObject)
        {
            var comment = await _context.Comments.FromSqlRaw("SELECT * FROM Comments WHERE Id = {0}", queryObject.CommentId).FirstOrDefaultAsync();

            if (comment == null || comment.UserId != queryObject.Userid) {
                return null;
            } 

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<Comment?> EditCommentContent(EditCommentQueryObject queryObject)
        {
            var comment = await _context.Comments.FromSqlRaw("SELECT * FROM Comments WHERE Id = {0}", queryObject.CommentId).FirstOrDefaultAsync();

            if (comment == null || comment.UserId != queryObject.Userid) {
                return null;
            }

            comment.Content = queryObject.CommentContent;
            await _context.SaveChangesAsync();
            return comment;
        }

        public async Task<(List<UnapprovedCommentDto?> Comments, bool HasNextPage)> GetUnapprovedComments(UnapprovedPostsQueryObject queryObject, string storeId)
        {
            // TODO - Need to request a snippet of the post content as well, to see what we are commenting on.
            var comments = await _context.Database.SqlQueryRaw<UnapprovedCommentDto>(
                @"
                SELECT
                    c.FirstName,
                    c.LastName,
                    c.CreatedAt,
                    c.Content
                FROM Comments c

                WHERE
                @ShopId = c.ShopId
                AND c.ApprovedComment = 0

                ORDER BY c.CreatedAt DESC
                OFFSET @PageNumber ROWS FETCH NEXT @PageSize ROWS ONLY",
                new SqlParameter("@ShopId", storeId),
                new SqlParameter("@PageNumber", (queryObject.PageNumber - 1) * queryObject.ResultsPerPage),
                new SqlParameter("@PageSize", queryObject.ResultsPerPage)
            ).ToListAsync();

            // Check if there's a "next page" by seeing if there are more records
            var totalComments = await _context.Comments
                .Where(c => c.ShopId == storeId && !c.ApprovedComment)
                .CountAsync();

            var hasNextPageComments = (queryObject.PageNumber * queryObject.ResultsPerPage) < totalComments;

            return (comments, hasNextPageComments);
        }
    }
}