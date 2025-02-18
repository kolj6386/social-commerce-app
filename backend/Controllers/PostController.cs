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
    public class ContentController : ControllerBase
    {
        private readonly IPostRepository _postRepo;
        private readonly ILogger<ContentController> _logger;

        public ContentController(IPostRepository postRepo, ILogger<ContentController> logger)
        {
            _postRepo = postRepo;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPosts([FromQuery]ContentQueryObject queryObject) {
            var content = await _postRepo.GetAllAsync(queryObject);
            return Ok(content);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id) {
            var post = await _postRepo.GetById(id);

            if (post == null) {
                return NotFound();
            }

            return Ok(post);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePostDto postDto) {
            // If the incoming request does not match the required DTO - block it. 
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            // turning our request into a proper Post via a dto mapper so it saves in the database
            var postModel = postDto.ToPostFromCreateDto();
            await _postRepo.CreatePost(postModel);
            return Ok($"post created for user: {postModel.UserId}");
        }

        [HttpPost("increment-view/{postId}")]
        public async Task<IActionResult> IncrementPostView([FromBody] IncrementViewQueryObject queryObject)
        {
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