using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    [Table("CommentReactions")]
    public class CommentReaction
    {
        public int Id {get; set;}
        public int CommentId {get; set;} // Foreign key to the post 
        public int UserId {get; set;} // Foreign key to the user 
        public string Type {get; set;} = string.Empty;
        
    }
}