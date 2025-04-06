using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace backend.Helpers
{
    public class ShopifyInstallQueryObject
    {
        public string Hmac { get; set;} = String.Empty;
        public string Host { get; set;} = String.Empty;
        public string Shop { get; set;} = String.Empty;
        public int Timestamp { get; set;}
    }

    public class ShopifyCallbackQueryObject
    {
        public string Code { get; set ; } = String.Empty;
        public string Hmac { get; set; } = String.Empty;
        public string Host { get; set; } = String.Empty;
        public string Shop { get; set; } = String.Empty;
        public string State { get; set; } = String.Empty;
        public int Timestamp { get; set;}
    }

    public class ShopifyTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = String.Empty;

    [JsonPropertyName("scope")]
    public string Scope { get; set; } = String.Empty;

    [JsonPropertyName("associated_user_scope")]
    public string AssociatedUserScope { get; set; } = String.Empty;

    [JsonPropertyName("associated_user")]
    public object AssociatedUser { get; set; } = String.Empty;
}
}