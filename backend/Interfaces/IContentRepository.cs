using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Helpers;
using backend.Models;

namespace backend.Interfaces
{
    public interface IContentRepository
    {
        Task<List<Content>> GetAllAsync(ContentQueryObject queryObject);
    }
}