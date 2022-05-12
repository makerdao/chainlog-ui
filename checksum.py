#! /usr/bin/env python3

from http.server import HTTPServer, BaseHTTPRequestHandler
from eth_utils import is_address, to_checksum_address

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        content = self.path[1:]
        if is_address(content):
            checksum = to_checksum_address(content)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(bytes(checksum, "utf-8"))
        else:
            self.send_response(400)
            self.end_headers()

server = HTTPServer(("0.0.0.0", 8080), Handler)
server.serve_forever()
