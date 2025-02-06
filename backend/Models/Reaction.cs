using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    [Table("Reactions")]
    public class Reaction
    {
        public int Id {get; set;}
        public int PostId {get; set;} // Foreign key to the post 
        // Can be either UserId (authenticated) or AnonymousId (guest user)
        public int? UserId {get; set;}
        public int AnonymousId {get; set;}
        public string Type {get; set;}
        public DateTime CreatedAt {get; set;}

    }
}