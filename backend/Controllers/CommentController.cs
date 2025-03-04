using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Helpers;
using backend.Interfaces;
using backend.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/comment")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IPostRepository _postRepository;

        public CommentController(ICommentRepository commentRepository, IPostRepository postRepository)
        {
            _commentRepository = commentRepository;
            _postRepository = postRepository;
        }

        [HttpPost("post")]
        public async Task<IActionResult> CreateCommentOnPost([FromQuery] CreateCommentQueryObject queryObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = ModelState
                        .Where(x => x.Value.Errors.Any())
                        .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray())
                });
            }

            var post = await _postRepository.GetById(queryObject.PostId);

            if (post == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Post does not exist"
                });
            }

            try
            {
                var commentModel = queryObject.ToCommentFromCreate();
                await _commentRepository.CreateCommentOnPost(commentModel);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Comment added successfully",
                    Data = new { commentModel.PostId, commentModel.Id }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An unexpected error occurred",
                    Data = ex.Message
                });
            }
        }

        [HttpPatch("edit")]
        public async Task<IActionResult> EditComment([FromBody] EditCommentQueryObject queryObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = ModelState
                        .Where(x => x.Value.Errors.Any())
                        .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray())
                });
            }

            var commentModel = await _commentRepository.EditCommentContent(queryObject);
            if (commentModel == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Comment not found or comment does not belong to user Id"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Comment edited successfully",
                Data = new { commentModel.Id, commentModel.Content }
            });

        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteComment([FromQuery] DeleteCommentQueryObject queryObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = ModelState
                        .Where(x => x.Value.Errors.Any())
                        .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray())
                });
            }

            var commentModel = await _commentRepository.DeleteCommentAsync(queryObject);

            if (commentModel == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Comment not found or not authorized to delete"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Comment deleted successfully",
                Data = new { commentModel.Id, commentModel.UserId }
            });
        }
    }
}