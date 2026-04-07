#!/usr/bin/env python3
"""
Dev server that mirrors app.yaml routing:
  /data/*  → served from <project-root>/data/
  /*       → served from <project-root>/src/
"""
import http.server
import os
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
DATA = os.path.join(ROOT, "data")


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = urllib.parse.unquote(path).split("?")[0].split("#")[0]
        if path.startswith("/data/"):
            return os.path.join(DATA, path[len("/data/"):])
        base = path.lstrip("/") or "index.html"
        return os.path.join(SRC, base)

    def log_message(self, fmt, *args):
        print(f"[server] {self.address_string()} - {fmt % args}")


httpd = http.server.HTTPServer(("", PORT), Handler)
print(f"Serving at http://localhost:{PORT}  (press Ctrl+C to stop)")
httpd.serve_forever()
