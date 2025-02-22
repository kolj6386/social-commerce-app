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

        public async Task<List<UnapprovedCommentDto?>> GetUnapprovedComments(UnapprovedPostsQueryObject queryObject, string storeId)
        {
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

            if (comments == null) {
                return null;
            }

            return comments;
        }
    }
}