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

        private IContentRepository _contentRepo;
        private readonly ApplicationDBContext _context;

        public ReactionRepository(IContentRepository contentRepo, ApplicationDBContext context)
        {
            _contentRepo = contentRepo;
            _context = context;
        }

        public async Task<Reaction> CreateReactionAsync(Reaction reactionModel)
        {
            // This needs to just do something simple. 
            // Add the reaction model
            // save the changes 
            /*
                public async Task<Comment> CreateAsync(Comment commentModel)
                {
                    await _context.Comments.AddAsync(commentModel);
                    await _context.SaveChangesAsync();
                    return commentModel;
                }
            */
            await _context.Reactions.AddAsync(reactionModel);
            await _context.SaveChangesAsync();
            return reactionModel;

            // var content = await _context.Contents.FirstOrDefaultAsync(c => c.Id == queryObject.PostId);

            // if (content == null) {
            //     return null;
            // }

            // var newReaction = new Reaction
            // {
            //     PostId = queryObject.PostId,
            //     Type = queryObject.Type,
            //     CreatedAt = DateTime.UtcNow
            // };

            // await _context.SaveChangesAsync();

            // return newReaction;
        }
    }
}