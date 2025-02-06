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
        public ContentRepository(ApplicationDBContext context)
        {
            _context = context;
        }
        public async Task<List<Content>> GetAllAsync(ContentQueryObject queryObject)
        {
            return await _context.Contents.ToListAsync();
        }

        public async Task<Content?> GetById(int id)
        {
            return await _context.Contents.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Content?> UpdateAsync(Content content)
        {
            var existingStock = await _context.Contents.FirstOrDefaultAsync(x => x.Id == content.Id);

            if (existingStock == null) {
                return null;
            }

            existingStock.Reactions = content.Reactions;

            await _context.SaveChangesAsync();
            return existingStock;

        }
    }
}