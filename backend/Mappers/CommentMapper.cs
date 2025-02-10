using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;

namespace backend.Mappers
{
    public static class CommentMapper
    {
        public static Comment ToCommentFromCreate(this CreateCommentQueryObject queryObject) {
            return new Comment {
                UserId = queryObject.Userid,
                PostId = queryObject.PostId,
                Content = queryObject.CommentContent
            };
        }
    }
}