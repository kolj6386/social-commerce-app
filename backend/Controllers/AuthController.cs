using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using backend.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /*
    TODO:
        Take the request here, verify it. 
        Update our databases with the details of the store
        Send a link back to Shopify. 
    */
    [Route("auth/shopify")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IConfiguration configuration, ILogger<AuthController> logger) {
            _configuration = configuration;
            _logger = logger;
        }


        [HttpGet("redirect")]
        public async Task<IActionResult> VerifyAndRedirectShopifyInstall([FromQuery] ShopifyInstallQueryObject queryObject) {
            var ClientId = _configuration["AppJWTKey:ApiKey"];
            var RedirectUri = "https://social-commerce.ngrok.app/auth/shopify/callback"; // TODO: Replace with actual URL - Replace with ngrok url
            var Scope = "write_products";
            var nonce = GenerateNonce();
            
            var shopifyUrl = new UriBuilder($"https://{queryObject.Shop}/admin/oauth/authorize")
            {
                Query = $"client_id={ClientId}&redirect_uri={Uri.EscapeDataString(RedirectUri)}&scope={Scope}&state={nonce}"
            };

        return Redirect(shopifyUrl.ToString());

        }

        [HttpGet("callback")]
        public async Task<IActionResult> CallBackUrl([FromQuery] ShopifyCallbackQueryObject queryObject)
        {
            var shop = queryObject.Shop;
            var code = queryObject.Code;
            var host = queryObject.Host;

            // Optional: validate the HMAC (see Shopify docs)
            if (!ValidateHmac(Request.Query, _configuration["AppJWTKey:JWTKey"]))
            {
                return BadRequest("HMAC validation failed.");
            }

            var clientId = _configuration["AppJWTKey:ApiKey"];
            var clientSecret = _configuration["AppJWTKey:JWTKey"];

            if (clientId == null || clientSecret == null) {
                return BadRequest("Missing app keys");
            }

            var tokenRequest = new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["code"] = code
            };

            using var httpClient = new HttpClient();
            var response = await httpClient.PostAsync(
                $"https://{shop}/admin/oauth/access_token",
                new FormUrlEncodedContent(tokenRequest)
            );

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, "Failed to retrieve access token");
            }

            // TODO: Save token and shop info to DB
            var content = await response.Content.ReadAsStringAsync();
            var shopifyToken = JsonSerializer.Deserialize<ShopifyTokenResponse>(content);



            _logger.LogInformation("sending redirect {shop}", $"https://?shop={shop}&host={Uri.EscapeDataString(host)}&embedded=1");
            Response.Headers.Remove("X-Frame-Options");
            Response.Headers.ContentSecurityPolicy = $"frame-ancestors https://{shop} https://admin.shopify.com https://*.spin.dev;";
            return Redirect($"https://prediction-sorts-september-objectives.trycloudflare.com/app?shop={shop}&host={Uri.EscapeDataString(host)}&embedded=1"); // TODO: Update this to return the actual correct URL. 
        }

        [HttpGet("/app")]
        public IActionResult RedirectToFrontend([FromQuery] ShopifyCallbackQueryObject queryObject)
        {
            /*
                Need to return either HTML or the website link... Here is a sample of what is working.
                {
                    string htmlContent = $@"
                    <html>
                    <head>
                        <title>Shopify App</title>
                    </head>
                    <body>
                        <h1>Welcome to the Shopify App</h1>
                        <p>Shop: {queryObject.Shop}</p>
                        <p>Host: {queryObject.Host}</p>
                    </body>
                    </html>";

                    return Content(htmlContent, "text/html");
                }
            */

            var redirectUrl = $"/app?shop={queryObject.Shop}&host={queryObject.Host}&embedded=1";
            return Redirect(redirectUrl);
        }

        private bool ValidateHmac(IQueryCollection queryParams, string clientSecret)
        {
            var hmac = queryParams["hmac"];
            var sortedParams = queryParams
                .Where(kvp => kvp.Key != "hmac")
                .OrderBy(kvp => kvp.Key, StringComparer.Ordinal)
                .Select(kvp => $"{kvp.Key}={kvp.Value}");

            var data = string.Join("&", sortedParams);
            var key = Encoding.UTF8.GetBytes(clientSecret);
            var dataBytes = Encoding.UTF8.GetBytes(data);

            using var hmacsha256 = new HMACSHA256(key);
            var hash = hmacsha256.ComputeHash(dataBytes);
            var calculatedHmac = BitConverter.ToString(hash).Replace("-", "").ToLower();

            return calculatedHmac == hmac;
        }

        private string GenerateNonce()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[16];
            rng.GetBytes(bytes);
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
        
    }
}