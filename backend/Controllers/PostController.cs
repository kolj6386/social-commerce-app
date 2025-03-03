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

        private readonly ICommentRepository _commentRepo;
        private readonly ILogger<PostController> _logger;

        public PostController(IPostRepository postRepo, ICommentRepository commentRepo)
        {
            _postRepo = postRepo;
            _commentRepo = commentRepo;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPosts([FromQuery]ContentQueryObject queryObject) {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // TODO - Add the store ID to the query object and only get posts belonging to this store
            var content = await _postRepo.GetAllAsync(queryObject);
            
            if (content == null) {
                return Ok(Array.Empty<string>());
            }

            return Ok(content);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id) {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // TODO - Add the store ID to the query object and only get posts belonging to this store
            var post = await _postRepo.GetById(id);

            if (post == null) {
                return NotFound();
            }

            return Ok(post);
        }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePostDto postDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                message = "Invalid request data",
                errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    )
            });
        }

        var origin = Request.Headers["Origin"].ToString();

        if (string.IsNullOrEmpty(origin))
        {
            return BadRequest(new
            {
                message = "Origin header missing"
            });
        }

        try
        {
            var postModel = postDto.ToPostFromCreateDto();
            postModel.ShopId = origin;
            await _postRepo.CreatePost(postModel);

            return Ok(new
            {
                message = "Post created successfully",
                userId = postModel.UserId,
                postId = postModel.Id
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "An unexpected error occurred",
                details = ex.Message
            });
        }
    }


        [HttpPost("increment-view/{postId}")]
        public async Task<IActionResult> IncrementPostView([FromBody] IncrementViewQueryObject queryObject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // Logic to increment the view counter for the post
            var ipAddress = HttpContext.Connection.RemoteIpAddress.ToString();

            var view = await _postRepo.AddPostView(queryObject, ipAddress);

            if (view == null) {
                return Ok("view not counted");
            }

            return Ok($"View added to post: {queryObject.PostId}");
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeletePost([FromQuery] DeletePostQueryObject queryObject) {
            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }

            var postModel = await _postRepo.DeletePost(queryObject);

            if (postModel == null) {
                return NotFound("Post not found or post does not belong to this user");
            }

            return Ok(postModel);
        }
        
    }
}