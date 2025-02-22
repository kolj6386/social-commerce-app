using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class DeletePostQueryObject
    {
        [Required(ErrorMessage = "Id of post is required")]
        public int postId { get; set; }
        [Required(ErrorMessage = "User Id of post is required")]
        public int userId { get; set; }
    }
}