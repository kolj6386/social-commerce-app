using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.Reaction;
using backend.Helpers;
using backend.Models;

namespace backend.Mappers
{
    public static class ReactionMapper
    {
        public static PostReaction ToReactionFromCreate(this CreateReactionDto reactionDto) {
            return new PostReaction {
                Type = reactionDto.Type,
                PostId = reactionDto.PostId,
                UserId = reactionDto.UserId,
            };
        }

        public static PostReaction ToReactionFromDelete(this DeleteReactionDto reactionDto) {
            return new PostReaction {
                PostId = reactionDto.PostId,
                UserId = reactionDto.UserId,
            };
        }

        public static CommentReaction ToCommentReactionFromCreate(this CreateCommentReactionDto commentReactionDto) {
            return new CommentReaction {
                Type = commentReactionDto.Type,
                CommentId = commentReactionDto.CommentId,
                UserId = commentReactionDto.UserId,
            };
        }

        public static CommentReaction ToCommentReactionFromDelete(this DeleteCommentReactionDto commentReactionDto) {
            return new CommentReaction {
                CommentId = commentReactionDto.CommentId,
                UserId = commentReactionDto.UserId,
            };
        }
    }
}