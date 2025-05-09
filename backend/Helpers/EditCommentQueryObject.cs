using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class EditCommentQueryObject
    {
        [Required(ErrorMessage = "Id of user is required")]
        public int Userid { get; set; }
        [Required(ErrorMessage = "Id of comment is required")]
        public int CommentId { get; set; }
        [Required(ErrorMessage = "Comment content cannot be null")]
        public string CommentContent { get; set; } = string.Empty;
    }
}