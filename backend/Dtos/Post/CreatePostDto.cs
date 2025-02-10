using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Dtos.Dtos.Post
{
    public class CreatePostDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "First name must contain at least 1 character")]
        [MaxLength(100, ErrorMessage = "First name cannot be over 100 characters")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MinLength(1, ErrorMessage = "Last name must contain at least 1 character")]
        [MaxLength(100, ErrorMessage = "Last name cannot be over 100 characters")]
        public string LastName { get; set; } = string.Empty;
        [Required]
        [MinLength(5, ErrorMessage = "Content must be 5 characters")]
        [MaxLength(280, ErrorMessage = "Content cannot be over 280 characters")]
        public string PostContent { get; set; } = string.Empty;

        [Required(ErrorMessage = "Post must have a product ID")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Post must have a userID")]
        public int UserId { get; set;}
        public List<string> PostMedia { get; set; } = new List<string>();
    }
}

        