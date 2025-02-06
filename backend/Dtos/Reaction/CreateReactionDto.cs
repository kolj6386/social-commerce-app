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
    }
}