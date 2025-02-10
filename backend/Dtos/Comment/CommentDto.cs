using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Comment
{
    public class CommentDisplayDto
    {
        public int CommentId {get; set;}
        public string CommentContent {get; set;} = string.Empty;
        public DateTime CreatedAt {get; set;}

    }
}