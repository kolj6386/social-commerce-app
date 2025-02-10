using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Helpers;
using backend.Interfaces;
using backend.Mappers;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Microsoft.AspNetCore.Mvc.Route("api/comment")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IPostRepository _postRepository;
        
        public CommentController(ICommentRepository commentRepository, IPostRepository postRepository) {
            _commentRepository = commentRepository;
            _postRepository = postRepository;
        }

        [HttpPost("post")]
        public async Task<IActionResult> CreateCommentOnPost([FromQuery] CreateCommentQueryObject queryObject) {
            // If the incoming request does not match the required DTO - block it. 
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            // check if the post exists first
            var post = await _postRepository.GetById(queryObject.PostId);

            if (post == null) {
                return BadRequest("post does not exist");
            }

            var commentModel = queryObject.ToCommentFromCreate();
            await _commentRepository.CreateCommentOnPost(commentModel);
            return Ok($"comment added to post: {commentModel.PostId}"); 
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteComment([FromQuery] DeleteCommentQueryObject queryObject) {
            if (!ModelState.IsValid) {
              // Handles validation of the incoming request - inherits from controllerBase
              return BadRequest(ModelState);
            }

            // Check if the comment exists first 
            var commentModel = await _commentRepository.DeleteCommentAsync(queryObject);

            if (commentModel == null) {
                return NotFound();
            }

            // This is a status 204 - because we are deleting there is nothing to return. 
            return Ok($"deleted comment:{commentModel.Id}, {commentModel.UserId}");
        }
    }
}