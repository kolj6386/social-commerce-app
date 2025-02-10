using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.Dtos.Post;
using backend.Models;

namespace backend.Mappers
{
    public static class PostMappers
    {
        /// <summary>
        /// 'this CreatePostDto postDto' → This makes ToCreatePostDto an extension method for the Post class.
        ///  Now, any Post object can call .ToCreatePostDto() as if it's a built-in method!
        /// </summary>
        /// <param name="postDto"></param>
        /// <returns></returns>
        public static Post ToPostFromCreateDto(this CreatePostDto postDto) {
            return new Post {
                FirstName = postDto.FirstName,
                LastName = postDto.LastName,
                PostContent = postDto.PostContent,
                ProductId = postDto.ProductId,
                UserId = postDto.UserId,
                PostMedia = postDto.PostMedia
            };
        }
    }
}