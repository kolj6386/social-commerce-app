using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class ApplicationDBContext : IdentityDbContext
    {
        public ApplicationDBContext(DbContextOptions dbContxtOptions) 
        : base(dbContxtOptions)
        {

        }

        public DbSet<Content> Contents {get; set;}

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Content>().HasData(
                new Content {
                Id = 1, 
                firstName = "John", 
                lastName = "Doe", 
                postComments = new List<string> { "First comment!", "Nice post!" },
                postContent = "This is an awesome view!",
                postMedia = new List<string> {"/image1.jpg", "image2.jpg"},
                postCreated = 173,
                postViews =  200
                }
            );
        }

    }
}