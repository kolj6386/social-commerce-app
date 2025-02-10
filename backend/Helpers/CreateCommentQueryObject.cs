using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class CreateCommentQueryObject
    {
        public int Userid { get; set; }
        public int PostId { get; set; }
        public string CommentContent { get; set; }
    }
}