import http.server
import socketserver
import os
import urllib.parse

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class OAuthRoutingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        # Handle clean OAuth callback routes
        if path in ['/oauth-callback', '/auth/callback', '/callback']:
            callback_file = os.path.join(DIRECTORY, 'oauth-callback.html')
            if os.path.exists(callback_file):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(callback_file, 'rb') as f:
                    self.wfile.write(f.read())
                return

        return super().do_GET()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), OAuthRoutingHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()
