using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.Reaction;
using backend.Helpers;
using backend.Interfaces;
using backend.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/reaction")]
    [ApiController]
    public class ReactionController : ControllerBase
    {
        private readonly IPostRepository _postRepo;
        private readonly IReactionRepository _reactionRepo;
        public ReactionController(IReactionRepository reactionRepo, IPostRepository postRepo)
        {
            _reactionRepo = reactionRepo;
            _postRepo = postRepo;
        }

        [HttpPost]
        [Route("{id:int}")]
        public async Task<IActionResult> CreateReaction([FromQuery]ReactionQueryObject queryObject, CreateReactionDto reactionDto) {
            // Need to get the comment from the content repository 
            var post = await _postRepo.GetById(queryObject.PostId);

            if (post == null ) {
                return BadRequest("Post does not exist");
            }

            var reactionModel = reactionDto.ToReactionFromCreate(queryObject);
            // Repository handles the database updates - so updating in here
            await _reactionRepo.CreateReactionAsync(reactionModel);

            return Ok($"Reaction added to post id: {queryObject.PostId}");
        }
    }
}