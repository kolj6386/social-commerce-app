using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Reaction
{
    public class CreateReactionDto
    {
        [Required]
        public string Type { get; set; } = string.Empty;
        [Required]
        public int PostId { get; set; } = 0;
        [Required]
        public int UserId { get; set; }
    }

    public class DeleteReactionDto
    {
        [Required]
        public int PostId { get; set; } = 0;
        [Required]
        public int UserId { get; set; }
    }

    public class CreateCommentReactionDto
    {
        [Required]
        public string Type { get; set; } = string.Empty;
        [Required]
        public int CommentId { get; set; } = 0;
        [Required]
        public int UserId { get; set; }
    }

        public class DeleteCommentReactionDto
    {
        [Required]
        public int CommentId { get; set; } = 0;
        [Required]
        public int UserId { get; set; }
    }
}