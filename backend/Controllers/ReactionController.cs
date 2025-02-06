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
        private readonly IContentRepository _contentRepo;
        private readonly IReactionRepository _reactionRepo;
        public ReactionController(IReactionRepository reactionRepo, IContentRepository contentRepo)
        {
            _reactionRepo = reactionRepo;
            _contentRepo = contentRepo;
        }

        [HttpPost]
        [Route("{id:int}")]
        public async Task<IActionResult> CreateReaction([FromQuery]ReactionQueryObject queryObject, int id, CreateReactionDto reactionDto) {
            // Need to get the comment from the content repository 
            var content = await _contentRepo.GetById(id);

            if (content == null ) {
                return BadRequest("Post does not exist");
            }

            // Create a reaction dto/model - essentially an updated 'Content'
            var reactionModel = reactionDto.ToReactionFromCreate(queryObject);
            reactionModel.PostId = content.Id;
            await _reactionRepo.CreateReactionAsync(reactionModel);

            if (content.Reactions == null) {
                content.Reactions = new List<string>();
            }
            content.Reactions.Add(reactionModel.Type);

            // Save the updated content to the database
            await _contentRepo.UpdateAsync(content);
            return Created($"/api/reaction/{reactionModel.Id}", content);
        }
    }
}