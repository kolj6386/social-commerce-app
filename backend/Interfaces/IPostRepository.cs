using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using backend.Dtos.Reaction.Post;
using backend.Helpers;
using backend.Models;

namespace backend.Interfaces
{
    public interface IPostRepository
    {
        Task<List<PostWithReactionsAndCommentsDto>> GetAllAsync(ContentQueryObject queryObject);
        Task<Post?> DeletePost(DeletePostQueryObject queryObject);
        Task<Post> CreatePost(Post post);
        Task<Post?> UpdateAsync(Post Post);
        Task<PostWithReactionsAndCommentsDto?> GetById(int id);
        Task<PostView> AddPostView(IncrementViewQueryObject queryObject, string? ipAddress);
        Task<bool> ApproveOrDissaprovePost(PostReviewQueryObject queryObject);
        Task<List<UnnapprovedPostsDto>> GetUnapprovedPosts(UnapprovedPostsQueryObject queryObject, string storeId);
    }
}