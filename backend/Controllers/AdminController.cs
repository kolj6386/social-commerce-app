using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IPostRepository _postRepo;
        private readonly ICommentRepository _commentRepo;

        public AdminController(IPostRepository postRepo, ICommentRepository commentRepo) {
            _postRepo = postRepo;
            _commentRepo = commentRepo;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPostsAndCommentsForReview([FromQuery]UnapprovedPostsQueryObject queryObject) {
            var adminPrincipal = HttpContext.Items["ShopifyAdmin"];
            if (adminPrincipal == null)
            {
                return Unauthorized(new { message = "Unauthorized access" });
            }

            var origin = Request.Headers["Origin"].ToString();

            if (string.IsNullOrEmpty(origin))
            {
                return BadRequest(new 
                {
                    message = "Origin header is missing"
                });
            }

            var (posts, hasNextPagePosts) = await _postRepo.GetUnapprovedPosts(queryObject, origin);
            var (comments, hasNextPageComments) = await  _commentRepo.GetUnapprovedComments(queryObject, origin);
            
            var response = new
            {
                Posts = new {
                    Posts = posts,
                    HasNextPage = hasNextPagePosts
                },
                Comments = new 
                {
                    Items = comments,
                    HasNextPage = hasNextPageComments
                }
            };

            return Ok(response);
        }

        [HttpPost("approve-post")]
        public async Task<IActionResult> ApproveAPost([FromBody] PostReviewQueryObject queryObject) {

            var adminPrincipal = HttpContext.Items["ShopifyAdmin"];
            if (adminPrincipal == null)
            {
                return Unauthorized(new { message = "Unauthorized access" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _postRepo.ApproveOrDissaprovePost(queryObject);
            
            if (!result) {
                return BadRequest("Post does not exist");
            }

            return Ok();
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeletePost([FromBody] DeletePostQueryObject queryObject) {
            var adminPrincipal = HttpContext.Items["ShopifyAdmin"];
            if (adminPrincipal == null)
            {
                return Unauthorized(new { message = "Unauthorized access" });
            }

            if (!ModelState.IsValid) {
                return BadRequest(ModelState);
            }

            var postModel = await _postRepo.AdminDeletePost(queryObject);

            if (postModel == null) {
                return NotFound("Post not found or post does not belong to this user");
            }

            return Ok(postModel);
        }
        
    }
}