using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Helpers;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repository
{
    public class ContentRepository : IContentRepository
    {
        private readonly ApplicationDBContext _context;
        private readonly ILogger<ContentRepository> _logger;
        public ContentRepository(ApplicationDBContext context, ILogger<ContentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task<List<Content>> GetAllAsync(ContentQueryObject queryObject)
        {
            _logger.LogInformation("fetching from inside repository");
            return await _context.Contents.ToListAsync();
        }
    }
}