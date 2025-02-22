using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Reaction
{
    public class CreateReactionDto
    {
        [Required(ErrorMessage = "type of reaction is required")]
        public string Type { get; set; } = string.Empty;
        [Required(ErrorMessage = "Id of post is required")]
        public int PostId { get; set; } = 0;
        [Required(ErrorMessage = "Id of user is required")]
        public int UserId { get; set; }
    }

    public class DeleteReactionDto
    {
        [Required(ErrorMessage = "Id of post is required")]
        public int PostId { get; set; } = 0;
        [Required(ErrorMessage = "Id of user is required")]
        public int UserId { get; set; }
    }

    public class CreateCommentReactionDto
    {
        [Required(ErrorMessage = "type of reaction is required")]
        public string Type { get; set; } = string.Empty;
        [Required(ErrorMessage = "Id of comment is required")]
        public int CommentId { get; set; } = 0;
        [Required(ErrorMessage = "Id of user is required")]
        public int UserId { get; set; }
    }

        public class DeleteCommentReactionDto
    {
        [Required(ErrorMessage = "Id of comment is required")]
        public int CommentId { get; set; } = 0;
        [Required(ErrorMessage = "Id of user is required")]
        public int UserId { get; set; }
    }
}