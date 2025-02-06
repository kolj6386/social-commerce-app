using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [Route("api/content")]
    [ApiController]
    public class ContentController : ControllerBase
    {
        private readonly IContentRepository _contentRepo;
        private readonly ILogger<ContentController> _logger;

        public ContentController(IContentRepository commentRepo, ILogger<ContentController> logger)
        {
            _contentRepo = commentRepo;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllContent([FromQuery]ContentQueryObject queryObject) {
            _logger.LogInformation("Fetching all content from the database"); // ✅ Logs in console
            var content = await _contentRepo.GetAllAsync(queryObject);
            _logger.LogInformation($"Retrieved {content.Count} items");
            return Ok(content);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id) {
            var content = await _contentRepo.GetById(id);

            if (content == null) {
                return NotFound();
            }

            return Ok(content);
        }
        
    }
}