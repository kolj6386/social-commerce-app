using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    [Keyless]
    [Table("PostViews")]
    public class PostView
    {

        public int PostId { get; set; }
        public int? UserId { get; set; }
        public string IpAddress { get; set; }
        public DateTime ViewedAt { get; set; }
    }
}