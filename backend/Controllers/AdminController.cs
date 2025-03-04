using System;
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

        public AdminController(IPostRepository postRepo, ICommentRepository commentRepo)
        {
            _postRepo = postRepo;
            _commentRepo = commentRepo;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllPostsAndCommentsForReview([FromQuery] UnapprovedPostsQueryObject queryObject)
        {
            var adminPrincipal = HttpContext.Items["ShopifyAdmin"];
            if (adminPrincipal == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized access"
                });
            }

            var origin = Request.Headers["Origin"].ToString();

            if (string.IsNullOrEmpty(origin))
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Origin header is missing"
                });
            }

            try
            {
                var (posts, hasNextPagePosts) = await _postRepo.GetUnapprovedPosts(queryObject, origin);
                var (comments, hasNextPageComments) = await _commentRepo.GetUnapprovedComments(queryObject, origin);

                var response = new
                {
                    Posts = new
                    {
                        Items = posts,
                        HasNextPage = hasNextPagePosts
                    },
                    Comments = new
                    {
                        Items = comments,
                        HasNextPage = hasNextPageComments
                    }
                };

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Data retrieved successfully",
                    Data = response
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An unexpected error occurred",
                    Errors = new Dictionary<string, string[]>
                    {
                        {"Exception", new[] {ex.Message}}
                    }
                });
            }
        }

        [HttpPost("approve-post")]
        public async Task<IActionResult> ApproveAPost([FromBody] PostReviewQueryObject queryObject)
        {
            var adminPrincipal = HttpContext.Items["ShopifyAdmin"];
            if (adminPrincipal == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized access"
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = ModelState
                        .Where(x => x.Value.Errors.Any())
                        .ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        )
                });
            }

            var result = await _postRepo.ApproveOrDissaprovePost(queryObject);

            if (!result)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Post does not exist or could not be updated"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Post approved successfully"
            });
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeletePost([FromBody] DeletePostQueryObject queryObject)
        {
            var adminPrincipal = HttpContext.Items["ShopifyAdmin"];
            if (adminPrincipal == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized access"
                });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid request data",
                    Errors = ModelState
                        .Where(x => x.Value.Errors.Any())
                        .ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        )
                });
            }

            var postModel = await _postRepo.AdminDeletePost(queryObject);

            if (postModel == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Post not found or not authorized to delete"
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Post deleted successfully",
                Data = new { postModel.Id, postModel.UserId }
            });
        }
    }
}
