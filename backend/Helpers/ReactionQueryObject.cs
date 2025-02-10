using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Helpers
{
    public class ReactionQueryObject
    {
        public int PostId {get; set;}
        public int UserId { get; set; }  // Nullable for anonymous users
        public string? Type { get; set; }
    }
}