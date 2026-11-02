#!/usr/bin/env python3
"""Private, READ-ONLY local browser preview; no GitHub operations, uploads, or analytics."""
from argparse import ArgumentParser
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, unquote
import os

class PreviewHandler(SimpleHTTPRequestHandler):
    # Only web runtime files should be served; never serve the tools/ or .github/ trees.
    def __init__(self, *args, directory=None, **kwargs):
        self.root = Path(directory).resolve()
        super().__init__(*args, directory=str(self.root), **kwargs)

    def list_directory(self, path):
        self.send_error(403, 'Directory listing disabled')
        return None

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('X-Frame-Options', 'DENY')
        super().end_headers()

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        parts = path.replace('\\','/').split('/')
        if any(s == '..' or s.startswith('.') for s in parts if s):
            self.send_error(403, 'Unsafe path')
            return None
        if any(s in {'tools', '.github', 'review'} for s in parts if s):
            self.send_error(403, 'Private audit source is not served')
            return None
        resolved = self.root.joinpath(path.lstrip('/')).resolve()
        if not resolved.is_relative_to(self.root):
            self.send_error(403, 'Invalid path')
            return None
        if resolved.is_dir() and resolved != self.root:
            self.send_error(403, 'Directory access disabled')
            return None
        if resolved == self.root:
            resolved = resolved / 'index.html'
        if resolved.suffix.lower() not in {'.html','.css','.js','.png','.svg','.ico','.webp','.jpg','.jpeg','.woff','.woff2','.json'}:
            self.send_error(403, 'Not a public web asset')
            return None
        return super().send_head()

    def log_message(self, fmt, *args):
        super().log_message(fmt,*args)


def main():
    p=ArgumentParser(description='Serve this offline static site for manual QA; never deploy or modify GitHub')
    p.add_argument('site',type=Path,nargs='?',default=Path(__file__).resolve().parents[2])
    p.add_argument('--host',default='127.0.0.1',help='default loopback only; 0.0.0.0 intentionally exposes to local network')
    p.add_argument('--port',type=int,default=8765)
    a=p.parse_args();site=a.site.resolve()
    if not (site/'index.html').is_file():p.error(f'index.html missing: {site}')
    if a.host not in {'127.0.0.1','localhost','::1'}:
        print('WARNING: non-loopback preview binds to a network interface. Use on trusted LAN only; no login or TLS.',flush=True)
    http=ThreadingHTTPServer((a.host,a.port),partial(PreviewHandler,directory=site))
    print(f'REVIEW ONLY: http://{a.host}:{http.server_port}/  (Ctrl+C to stop; no GitHub deployment)',flush=True)
    try:http.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:pass
    finally:http.server_close()
if __name__=='__main__':main()
