using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    [Table("Comments")]
    public class Comment
    {
        public int Id {get; set;}
        public int UserId {get; set;}
        public int PostId {get; set;}
        public string Content {get; set;} = string.Empty;
        public DateTime CreatedAt {get; set;} = DateTime.Now;
    }
}