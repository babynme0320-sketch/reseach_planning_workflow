#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import urllib.parse

PORT = 8899
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class DashboardHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/read':
            query = urllib.parse.parse_qs(parsed_url.query)
            file_param = query.get('file', [None])[0]
            
            if not file_param:
                self.send_error(400, "Missing file parameter")
                return

            # Prevent directory traversal attacks
            safe_path = os.path.normpath(file_param).lstrip('/')
            full_path = os.path.join(DIRECTORY, safe_path)
            
            if not full_path.startswith(DIRECTORY):
                self.send_error(403, "Access Denied")
                return

            if not os.path.exists(full_path) or os.path.isdir(full_path):
                self.send_error(404, "File Not Found")
                return

            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.send_error(500, str(e))
            return
            
        return super().do_GET()

def run_server():
    # Force socket reuse to prevent port-in-use errors on restarts
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DashboardHTTPRequestHandler) as httpd:
        print(f"==================================================")
        print(f"🚀 Bio-R&D Proposal Dashboard Server Running!")
        print(f"👉 Access URL: http://localhost:{PORT}")
        print(f"📁 Directory: {DIRECTORY}")
        print(f"==================================================")
        
        # Open in default web browser
        webbrowser.open(f"http://localhost:{PORT}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            httpd.shutdown()

if __name__ == "__main__":
    run_server()
