using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    [Table("PostReactions")]
    public class PostReaction
    {
        public int Id {get; set;}
        public int PostId {get; set;} // Foreign key to the post 
        public int UserId {get; set;} // Foreign key to the user 
        public string Type {get; set;} = string.Empty;
    }
}