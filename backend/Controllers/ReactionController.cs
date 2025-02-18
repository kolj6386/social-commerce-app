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
        public async Task<IActionResult> CreateReactionOnPost([FromBody] CreateReactionDto reactionDto) {

            var reactionModel = reactionDto.ToReactionFromCreate();
            // Repository handles the database updates - so updating in here
            var success = await _reactionRepo.CreateReactionOnPostAsync(reactionModel);
            if (!success)
            {
                return BadRequest("Post does not exist");
            }

            return Ok($"Reaction added to post id: {reactionDto.PostId}");
        }        
        
        [HttpPost("comment-reaction")]
        public async Task<IActionResult> CreateReactionOnComment([FromBody] CreateCommentReactionDto commentReactionDto) {

            var commentReactionModel = commentReactionDto.ToCommentReactionFromCreate();
            var success = await _reactionRepo.CreateReactionOnCommentAsync(commentReactionModel); 

            if (!success)
            {
                return BadRequest("Comment does not exist");
            }

            return Ok($"Reaction added to post id: {commentReactionDto.CommentId}");

        }

        [HttpDelete]
        public async Task<IActionResult> DeletePostReaction([FromBody] DeleteReactionDto reactionDto) {
            var postReactionDeleteModel = reactionDto.ToReactionFromDelete();
            var success = await _reactionRepo.DeleteReactionOnPostAsync(postReactionDeleteModel);

            if (!success) {
                return BadRequest("Could not delete Reaction on Post, Post may not exist");
            }

            return Ok($"Reaction deleted on post id: {reactionDto.PostId}");
        }

        [HttpDelete("comment-reaction")]
        public async Task<IActionResult> DeleteCommentReaction([FromBody] DeleteCommentReactionDto commentReactionDto) {
            var commentReactionDeleteModel = commentReactionDto.ToCommentReactionFromDelete();
            var success = await _reactionRepo.DeleteReactionOnCommentAsync(commentReactionDeleteModel);

            if (!success) {
                return BadRequest("Could not delete Reaction on Post, Post may not exist");
            }

            return Ok($"Reaction deleted on post id: {commentReactionDto.CommentId}");
        }
    }
    
}