using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;

namespace backend.Middleware
{
    public class JwtAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public JwtAuthMiddleware(RequestDelegate next, IConfiguration configuration) {
            _next = next;
            _configuration = configuration;
        }

        public async Task Invoke(HttpContext context) {

            var sessionToken = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(sessionToken)) {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            try
            {
                var secretShopifyKey = _configuration["AppJWTKey:JWTKey"];
                if (string.IsNullOrEmpty(secretShopifyKey))
                {
                    throw new InvalidOperationException("JWTKey not found.");
                }

                var key = Encoding.ASCII.GetBytes(secretShopifyKey);
                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadToken(sessionToken) as JwtSecurityToken;
                var shopDomain = jsonToken?.Claims.FirstOrDefault(c => c.Type == "dest")?.Value;
                
                if (string.IsNullOrEmpty(shopDomain) || !shopDomain.EndsWith(".myshopify.com"))
                {
                    throw new SecurityTokenException("Invalid shop domain.");
                }

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = "https://pixel-commerce-dev.myshopify.com/admin",
                    ValidateAudience = true,
                    ValidAudience = "9a69f02ca87522fd0b06754111f19143",
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(sessionToken, validationParameters, out _);
                context.Items["ShopifyAdmin"] = principal;
                await _next(context);
            }
            catch (System.Exception)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            }


        }
    }
}