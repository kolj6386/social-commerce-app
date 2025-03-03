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

    public class CommentDisplayithReactionsDto
    {
        public int CommentId {get; set;}
        public string CommentContent {get; set;} = string.Empty;
        public List<string> CommentReactions { get; set; } = new List<string>();
        public DateTime CreatedAt {get; set;}
    }
    public class UnapprovedCommentDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Content {get; set;} = string.Empty;
        public DateTime CreatedAt {get; set;}
    }
}