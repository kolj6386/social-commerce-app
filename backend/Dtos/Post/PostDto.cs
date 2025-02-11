using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.Comment;
using backend.Dtos.Dtos.Reaction;

namespace backend.Dtos.Reaction.Post
{
    public class PostWithReactionsDto
    {
        public int Id { get; set;}
        public int ProductId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PostContent { get; set; } = string.Empty;
        public DateTime PostCreated { get; set; } = DateTime.Now;
        public List<string> PostMedia { get; set; } = new List<string>();
        public int PostViews { get; set; }
        public List<ReactionDto> Reactions { get; set; } = new();
    }

    public class PostWithReactionsAndCommentsDto
    {
        public int Id { get; set;}
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PostContent { get; set; } = string.Empty;
        public DateTime PostCreated { get; set; } = DateTime.Now;
        public List<string> PostMedia { get; set; } = new List<string>();
        public int PostViews { get; set; }
        public List<string> Reactions { get; set; } = new List<string>();
        public List<CommentDto> Comments { get; set; }
    }

    public class PostWithCommentWithReactionsFlatDto
    {
        public int PostId { get; set; }
        public int PostUserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PostContent { get; set; } = string.Empty;
        public DateTime PostCreated { get; set; }
        public int PostViews { get; set; }
        public string PostMedia { get; set; } = string.Empty; // This will be JSON if stored as an array

        public int? CommentId { get; set; }
        public int? CommentUserId { get; set; }
        public string? CommentContent { get; set; }
        public DateTime? CommentCreated { get; set; }

        public string? PostReactionType { get; set; }
        public string? CommentReactionType { get; set; }
    }

        public class CommentDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<string> Reactions { get; set; } = new();
    }

    public class ReactionOnCommentDto
    {
        public int CommentId { get; set; }
        public List<string> Reactions { get; set; } = new();
    }


    public class CommentWithReactionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CommentContent { get; set; } = string.Empty;
        public DateTime CreatedAt {get; set;}
        public List<ReactionOnCommentDto> Reactions { get; set; } = new();
    }

    public class SinglePostWithReactionsAndCommentsDto {
        public int Id { get; set;}
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PostContent { get; set; } = string.Empty;
        public DateTime PostCreated { get; set; } = DateTime.Now;
        public List<string> PostMedia { get; set; } = new List<string>();
        public int PostViews { get; set; }
        public List<string> Reactions { get; set; } = new List<string>();
        public List<CommentDto> Comments { get; set; }
    }

        public class SinglePostWithCommentWithReactionsFlatDto
    {
        public int PostId { get; set; }
        public int PostUserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PostContent { get; set; } = string.Empty;
        public DateTime PostCreated { get; set; }
        public int PostViews { get; set; }
        public string PostMedia { get; set; } = string.Empty; // This will be JSON if stored as an array

        public int? CommentId { get; set; }
        public int? CommentUserId { get; set; }
        public string? CommentContent { get; set; }
        public DateTime? CommentCreated { get; set; }

        public string? PostReactionType { get; set; }
        public string? CommentReactionType { get; set; }
    }

}