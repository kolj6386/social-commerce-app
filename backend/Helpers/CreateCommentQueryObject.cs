using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class CreateCommentQueryObject
    {
        [Required(ErrorMessage = "Id of user is required")]
        public int Userid { get; set; }
        [Required(ErrorMessage = "Id of post is required")]
        public int PostId { get; set; }
        [Required(ErrorMessage = "Comment content cannot be null")]
        public string CommentContent { get; set; }
    }
}