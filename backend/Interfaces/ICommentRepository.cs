using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;

namespace backend.Interfaces
{
    public interface ICommentRepository
    {
        Task<Comment> CreateCommentOnPost(Comment Comment);
        Task<Comment?> DeleteCommentAsync(DeleteCommentQueryObject queryObject);
    }
}