import http.server

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        if self.path.split('?')[0].lower().endswith('.mp3'):
            self.send_header('Cache-Control', 'max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()

http.server.ThreadingHTTPServer(('', 8420), H).serve_forever()
