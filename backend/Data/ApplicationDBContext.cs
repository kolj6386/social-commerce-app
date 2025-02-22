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

        public DbSet<Post> Posts {get; set;}
        public DbSet<PostReaction> PostReactions {get; set;}
        public DbSet<Comment> Comments { get; set; }
        public DbSet<User> Accounts { get; set; }
        public DbSet<CommentReaction> CommentReactions { get; set; }
        public DbSet<PostView> PostViews { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Post>().HasData(
                new Post {
                Id = 1, 
                ProductId = 112223344, 
                UserId = 1,
                FirstName = "jesse",
                LastName = "k",
                PostContent = "seeded post data",
                PostCreated = DateTime.Now,
                PostMedia = new List<string> {"/image1.jpg", "image2.jpg"},
                PostViews = 100,
                ShopId = "pixel-commerce-dev.myshopify.com",
                ApprovedPost = false
                },
                new Post {
                Id = 2, 
                ProductId = 112223344, 
                UserId = 1,
                FirstName = "jesse",
                LastName = "kerger",
                PostContent = "seeded post data2",
                PostCreated = DateTime.Now,
                PostMedia = new List<string> {"/image1.jpg", "/image2.jpg"},
                PostViews = 100,
                ShopId = "pixel-commerce-dev.myshopify.com",
                ApprovedPost = false
                }
            );
        }

    }
}