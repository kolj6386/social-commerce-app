using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.Comment;
using backend.Helpers;
using backend.Models;

namespace backend.Interfaces
{
    public interface ICommentRepository
    {
        Task<Comment> CreateCommentOnPost(Comment Comment);
        Task<Comment?> DeleteCommentAsync(DeleteCommentQueryObject queryObject);
        Task<(List<UnapprovedCommentDto?> Comments, bool HasNextPage)> GetUnapprovedComments(UnapprovedPostsQueryObject queryObject, string storeId);
    }
}