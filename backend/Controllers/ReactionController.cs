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
        private readonly IReactionRepository _reactionRepo;
        public ReactionController(IReactionRepository reactionRepo)
        {
            _reactionRepo = reactionRepo;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReactionOnPost([FromBody] CreateReactionDto reactionDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray());

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var reactionModel = reactionDto.ToReactionFromCreate();
            var success = await _reactionRepo.CreateReactionOnPostAsync(reactionModel);
            if (!success)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Post does not exist"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Reaction added successfully",
                Data = new { reactionDto.PostId }
            });
        }

        [HttpPost("comment-reaction")]
        public async Task<IActionResult> CreateReactionOnComment([FromBody] CreateCommentReactionDto commentReactionDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray());

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var commentReactionModel = commentReactionDto.ToCommentReactionFromCreate();
            var success = await _reactionRepo.CreateReactionOnCommentAsync(commentReactionModel);

            if (!success)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Comment does not exist"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Reaction added successfully",
                Data = new { commentReactionDto.CommentId }
            });
        }

        [HttpDelete]
        public async Task<IActionResult> DeletePostReaction([FromBody] DeleteReactionDto reactionDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray());

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var postReactionDeleteModel = reactionDto.ToReactionFromDelete();
            var success = await _reactionRepo.DeleteReactionOnPostAsync(postReactionDeleteModel);

            if (!success)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Could not delete reaction on post, post may not exist"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Reaction deleted successfully",
                Data = new { reactionDto.PostId }
            });
        }

        [HttpDelete("comment-reaction")]
        public async Task<IActionResult> DeleteCommentReaction([FromBody] DeleteCommentReactionDto commentReactionDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray());

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var commentReactionDeleteModel = commentReactionDto.ToCommentReactionFromDelete();
            var success = await _reactionRepo.DeleteReactionOnCommentAsync(commentReactionDeleteModel);

            if (!success)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Could not delete reaction on comment, comment may not exist"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Reaction deleted successfully",
                Data = new { commentReactionDto.CommentId }
            });
        }
    }
}
