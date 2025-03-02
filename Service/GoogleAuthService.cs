using Google.Apis.Auth;
using System.Threading.Tasks;

namespace GatherApp.Services
{
    public class GoogleAuthService
    {
        private readonly string _googleClientId;

        public GoogleAuthService(IConfiguration configuration)
        {
            _googleClientId = configuration?["GoogleAuth:ClientId"] ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<GoogleJsonWebSignature.Payload?> ValidateGoogleToken(string idToken)
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _googleClientId }
                });
                return payload;
            }
            catch
            {
                return null;
            }
        }
    }
}