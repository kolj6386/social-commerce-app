using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class PostReviewQueryObject
    {
        [Required(ErrorMessage = "Id of post is required")]
        public int PostId { get; set; }
        [Required(ErrorMessage = "Approved boolean missing")]
        public bool Approved { get; set; }
    }
}