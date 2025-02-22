using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class IncrementViewQueryObject
    {
        [Required(ErrorMessage = "Id of user is required")]
        public int? UserId { get; set; }
        [Required(ErrorMessage = "Id of post is required")]
        public int PostId { get; set; }
    }
}