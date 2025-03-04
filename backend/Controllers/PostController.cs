using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.Dtos.Post;
using backend.Helpers;
using backend.Interfaces;
using backend.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/post")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IPostRepository _postRepo;
        private readonly ILogger<PostController> _logger;

        public PostController(IPostRepository postRepo)
        {
            _postRepo = postRepo;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPosts([FromQuery]ContentQueryObject queryObject)
        {
            // TODO - Add the store ID to the query object and only get posts belonging to this store
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var content = await _postRepo.GetAllAsync(queryObject);

            if (content == null || !content.Any())
            {
                return Ok(new ApiResponse<IEnumerable<string>>
                {
                    Success = true,
                    Message = "No posts found",
                    Data = Array.Empty<string>()
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Posts retrieved successfully",
                Data = content
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var post = await _postRepo.GetById(id);

            if (post == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Post not found"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Post retrieved successfully",
                Data = post
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePostDto postDto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var origin = Request.Headers["Origin"].ToString();

            if (string.IsNullOrEmpty(origin))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Origin header missing"
                });
            }

            try
            {
                var postModel = postDto.ToPostFromCreateDto();
                postModel.ShopId = origin;
                await _postRepo.CreatePost(postModel);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Post created successfully",
                    Data = new { postModel.UserId, postModel.Id }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An unexpected error occurred",
                    Errors = new Dictionary<string, string[]> { { "Exception", new[] { ex.Message } } }
                });
            }
        }

        [HttpPost("increment-view/{postId}")]
        public async Task<IActionResult> IncrementPostView([FromBody] IncrementViewQueryObject queryObject)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();

            var view = await _postRepo.AddPostView(queryObject, ipAddress);

            if (view == null)
            {
                return Ok(new ApiResponse<string>
                {
                    Success = true,
                    Message = "View not counted"
                });
            }

            return Ok(new ApiResponse<string>
            {
                Success = true,
                Message = $"View added to post: {queryObject.PostId}"
            });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeletePost([FromQuery] DeletePostQueryObject queryObject)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = errors
                });
            }

            var postModel = await _postRepo.DeletePost(queryObject);

            if (postModel == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Post not found or post does not belong to this user"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Post deleted successfully",
                Data = postModel
            });
        }
    }
}
