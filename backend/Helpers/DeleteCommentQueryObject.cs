using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class DeleteCommentQueryObject
    {
        public int Userid { get; set; }
        public int CommentId { get; set; }
    }
}