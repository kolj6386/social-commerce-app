using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;

namespace backend.Interfaces
{
    public interface IReactionRepository
    {
        Task<bool> CreateReactionOnPostAsync(PostReaction reactionModel);
        Task<bool> CreateReactionOnCommentAsync(CommentReaction reactionCommentModel);
        Task<bool> DeleteReactionOnPostAsync(PostReaction reactionModel);
        Task<bool> DeleteReactionOnCommentAsync(CommentReaction reactionCommentModel);
    }
}