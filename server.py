import http.server
import socketserver
import os
import urllib.parse
import urllib.request
import urllib.error
import json
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
HUBSPOT_TOKEN_URL = 'https://api.hubapi.com/oauth/v1/token'

CLIENT_ID = "2f68b95c-5172-45d0-9392-289a7eba3be7"
CLIENT_SECRET = "cf29cf73-7057-4659-8ffb-2eb3c8506a2e"
REDIRECT_URI = f"http://localhost:{PORT}/oauth-callback"

class OAuthRoutingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')
        query_params = urllib.parse.parse_qs(parsed.query)

        # Handle clean OAuth callback routes
        if path in ['/oauth-callback', '/auth/callback', '/callback']:
            code = query_params.get('code', [None])[0]
            print(f"\n[HubSpot OAuth Callback] Auth Code: {code}")

            exchange_status = "Waiting for authorization..."
            hub_id = "N/A"

            if code:
                try:
                    payload = urllib.parse.urlencode({
                        'grant_type': 'authorization_code',
                        'client_id': CLIENT_ID,
                        'client_secret': CLIENT_SECRET,
                        'redirect_uri': REDIRECT_URI,
                        'code': code
                    }).encode('utf-8')

                    req = urllib.request.Request(HUBSPOT_TOKEN_URL, data=payload, headers={
                        'Content-Type': 'application/x-www-form-urlencoded'
                    })

                    with urllib.request.urlopen(req) as resp:
                        token_response_json = json.loads(resp.read().decode('utf-8'))
                        hub_id = token_response_json.get('hub_id', 'Connected')
                        exchange_status = f"TOKEN EXCHANGED SUCCESSFULLY! Hub ID: {hub_id} is now an ACTIVE INSTALL."
                        print(f"[HubSpot API Token Success] Hub ID: {hub_id}")
                except urllib.error.HTTPError as he:
                    err_body = he.read().decode('utf-8', errors='ignore')
                    exchange_status = f"Token exchange error ({he.code}): {err_body}"
                    print(f"[HubSpot Token Exchange HTTP Error {he.code}]: {err_body}")
                except Exception as e:
                    exchange_status = f"Token exchange exception: {e}"
                    print(f"[HubSpot Token Exchange Exception]: {e}")

            # Serve callback HTML
            callback_file = os.path.join(DIRECTORY, 'oauth-callback.html')
            content = "<html><body><h1>HubSpot Connected</h1></body></html>"
            if os.path.exists(callback_file):
                with open(callback_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                content = content.replace('49664631', f'49664631<br /><strong>Hub ID:</strong> {hub_id}<br /><strong>Status:</strong> {exchange_status}')

            try:
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                print(f"[Response Send Error]: {e}")
            return

        return super().do_GET()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), OAuthRoutingHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print(f"OAuth Ready with Client ID: {CLIENT_ID}")
        httpd.serve_forever()
