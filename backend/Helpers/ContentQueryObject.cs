using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class ContentQueryObject
    {
        [Required(ErrorMessage = "Type is required.")]
        [RegularExpression("^(post|review)$", ErrorMessage = "Type must be 'post' or 'review'.")]
        public string? Type { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "PageNumber must be at least 1.")]
        public int? PageNumber { get; set; } = 1; // Default value if not provided

        [Range(1, 100, ErrorMessage = "ResultsPerPage must be between 1 and 100.")]
        public int? ResultsPerPage { get; set; } = 10; // Default value

        public bool? ApprovedPosts { get; set; } = true;
    }
}