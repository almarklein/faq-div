import os
import json
import socket

import asgineer
import markdown
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name


stats_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)


def send_stats(request, status_code=None, rtime=None, is_page=None):
    """ Send request stats over UPD to a stats server. """
    mypaas_service = os.getenv("MYPAAS_SERVICE", "")
    if not mypaas_service:
        return
    p = request.path
    stats = {"group": mypaas_service}
    stats["requests|count"] = 1
    stats["path|cat"] = f"{status_code} - {p}" if (status_code and p) else p
    if rtime is not None:
        stats["rtime|num|s"] = float(rtime)
    if is_page:  # anomimously register page view, visitors, language, and more
        stats["pageview"] = request.headers
    try:
        stats_socket.sendto(json.dumps(stats).encode(), ("stats", 8125))
    except Exception:
        pass


def md_highlight(text):
    """Apply syntax highlighting."""
    lines = []
    code = []
    for i, line in enumerate(text.splitlines()):
        if line.startswith("```"):
            if code:
                formatter = HtmlFormatter()
                try:
                    lexer = get_lexer_by_name(code[0])
                except Exception:
                    lexer = get_lexer_by_name("text")
                lines.append(highlight("\n".join(code[1:]), lexer, formatter))
                code = []
            else:
                code.append(line[3:].strip())  # language
        elif code:
            code.append(line)
        else:
            lines.append(line)
    return "\n".join(lines).strip()


def collect_assets():
    # Collect
    this_dir = os.path.dirname(__file__)
    assets = {}
    example_names = []
    for subdir in ("", "img", "examples"):
        for fname in os.listdir(os.path.join(this_dir, subdir)):
            filename = os.path.join(this_dir, subdir, fname)
            if not os.path.isfile(filename):
                continue
            elif fname.endswith((".md", ".html", ".js", ".css")):
                with open(filename, "rb") as f:
                    assets[fname] = f.read().decode()
                if subdir == "examples" and fname.endswith(".html"):
                    example_names.append(fname[:-5])
            elif fname.endswith((".png", ".jpg")):
                with open(filename, "rb") as f:
                    assets[fname] = f.read()

    # Post processing
    faq_html = markdown.markdown(md_highlight(assets["faq.md"]), extensions=[])
    index_html = assets["index.html"]
    index_html = index_html.replace("FAQ_HERE", faq_html)
    index_html = index_html.replace(
        "EXAMPLE_NAMES", ", ".join(repr(x) for x in sorted(example_names))
    )
    assets["index.html"] = index_html

    return assets


asset_handler = asgineer.utils.make_asset_handler(collect_assets())


@asgineer.to_asgi
async def main_handler(request):

    path = request.path.lstrip("/")

    response = await asset_handler(request, path or "index.html")
    response = asgineer.utils.normalize_response(response)

    is_page = "." not in path or path.endswith(".html")
    send_stats(request, response[0], is_page=is_page)

    return response


def serve():
    asgineer.run(main_handler, "uvicorn", "0.0.0.0:80", log_level="warning")


if __name__ == "__main__":
    serve()
