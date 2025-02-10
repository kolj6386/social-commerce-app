using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Helpers;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class ReactionRepository : IReactionRepository
    {

        private IPostRepository _postRepo;
        private readonly ApplicationDBContext _context;

        public ReactionRepository(IPostRepository postRepo, ApplicationDBContext context)
        {
            _postRepo = postRepo;
            _context = context;
        }

        public async Task<PostReaction> CreateReactionAsync(PostReaction reactionModel)
        {
            // need to insert the reaction into our table 
            await _context.Database.ExecuteSqlRawAsync(
                "INSERT INTO Reactions (UserId, PostId, Type) VALUES ({0}, {1}, {2})",
                reactionModel.UserId, reactionModel.PostId, reactionModel.Type
            );
            await _context.SaveChangesAsync();
            return reactionModel;
        }
    }
}