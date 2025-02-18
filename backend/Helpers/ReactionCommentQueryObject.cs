using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class ReactionCommentQueryObject
    {
        public int CommentId {get; set;}
        public int UserId { get; set; }
        public string? Type { get; set; }
    }
}