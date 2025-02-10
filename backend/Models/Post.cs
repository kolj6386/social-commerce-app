using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    [Table("Posts")]
    public class Post
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int UserId { get; set;} // Foriegn key to link to the user who made the post
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PostContent { get; set; } = string.Empty;
        public DateTime PostCreated { get; set; } = DateTime.Now;
        public List<string> PostMedia { get; set; } = new List<string>();
        public int PostViews { get; set; }
    }
}