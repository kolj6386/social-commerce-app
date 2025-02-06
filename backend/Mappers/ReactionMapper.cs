using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Dtos.Reaction;
using backend.Helpers;
using backend.Models;

namespace backend.Mappers
{
    public static class ReactionMapper
    {
        public static Reaction ToReactionFromCreate(this CreateReactionDto reactionDto, ReactionQueryObject queryObject) {
            return new Reaction {
                AnonymousId = 1,
                Type = queryObject.Type,
                PostId = queryObject.PostId
            };
        }
    }
}