import os
import socket
from wsgiref.simple_server import WSGIServer, WSGIRequestHandler

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "devory.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()


class UnixWSGIServer(WSGIServer):
    address_family = socket.AF_UNIX

    def get_request(self):
        request, _ = super().get_request()
        return request, ("localhost", 0)


def run_on_socket():
    socket_path = os.environ["SOCKET"]

    if os.path.exists(socket_path):
        os.unlink(socket_path)

    server = UnixWSGIServer(socket_path, WSGIRequestHandler)
    server.set_app(application)
    os.chmod(socket_path, 0o660)
    print(f"Django WSGI listening on {socket_path}", flush=True)

    try:
        server.serve_forever()
    finally:
        server.server_close()
        if os.path.exists(socket_path):
            os.unlink(socket_path)


def run_on_port():
    host = os.environ["INSTANCE_HOST"]
    port = int(os.environ["PORT"])

    server = WSGIServer((host, port), WSGIRequestHandler)
    server.set_app(application)
    print(f"Django WSGI listening on {host}:{port}", flush=True)
    server.serve_forever()


if "SOCKET" in os.environ:
    run_on_socket()
else:
    run_on_port()