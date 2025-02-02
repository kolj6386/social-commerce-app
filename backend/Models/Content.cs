using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models
{
    public class Content
    {
        public int Id {get; set;}
        public string firstName {get; set;}
        public string lastName {get; set;}
        public List<string> postComments {get; set;}
        public string postContent {get; set;} 
        public int postCreated {get; set;}
        public List<string> postMedia {get; set;}
        public int postViews {get; set;} 
    }
}