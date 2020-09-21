import os
import json
import socket

import asgineer
import markdown
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name


# %% Loading and generating assets


HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>TITLE</title>
</head>
<body>
<style>
body {
    background: #fff;
    font-family: "Lucida Sans Unicode", Verdana, sans-serif;
    font-size: 108%;
    line-height: 140%;
    color: #222;
}
h1 {
    text-align: center;
    margin: 1.5em 0;
}
h2 {
    color: #c00;
    font-family: "Lucida Console", "Courier new", monospace;
    text-align: center;
    margin: 1.2em 0;
}
hr {
    background: #ccf;
    border: none;
    height: 1px;
    margin: 2em 0;
}
a, a:link, a:visited, a:active, a:hover {
    color: #555;
    text-decoration: underline;
}
a:hover {
    color: #000;
}
.content {
    max-width: 800px;
    margin: 1em auto 1em auto;
}
</style>
<div class='content'>
<center>
<a href='/'><img src='/faqdiv-wide.png' width='75%'></img></a>
</center>
<br />

HTML

<br /><br /><br /><br />
</div>
</body>
</html>
""".lstrip()


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


def md2html(text):
    text2 = md_highlight(text)
    html = markdown.markdown(text, extensions=[])
    return html


def collect_assets():
    # Collect
    this_dir = os.path.abspath(os.path.dirname(__file__))
    assets = {}
    example_names = []
    for subdir in ("", "examples", "img", "blog/img"):
        fulldir = os.path.join(this_dir, subdir) if subdir else this_dir
        for fname in os.listdir(fulldir):
            filename = os.path.join(fulldir, fname)
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

    # Collect blog pages
    blogpages = {}
    for fname in os.listdir(os.path.join(this_dir, "blog")):
        if fname.endswith(".md"):
            fname2 = "blog/" + fname[:-3] + ".html"
            with open(os.path.join(this_dir, "blog", fname), "rb") as f:
                text = f.read().decode()
            html = md2html(text)
            html = HTML_TEMPLATE.replace("HTML", html).replace("wide.png", "blog.png")
            html = html.replace("TITLE", "FAQ-div blog")
            assets[fname2] = html
            title = text.splitlines()[0].strip("#").strip()
            date = text.split("-- DATE:")[1].split("--")[0].strip()
            assert len(date) == 10
            blogpages[date] = fname2, title
    html = "<h2>Pages</h2>\n\n"
    for date in sorted(blogpages.keys(), reverse=False):
        fname, title = blogpages[date]
        html += f"<a href='/{fname}'>{title}</a><br />\n"
    html = HTML_TEMPLATE.replace("HTML", html).replace("wide.png", "blog.png")
    html = html.replace("TITLE", "FAQ-div blog")
    assets["blog"] = assets["blog/"] = html

    # Post processing
    faq_html = md2html(assets["faq.md"])
    index_html = assets["index.html"]
    index_html = index_html.replace("FAQ_HERE", faq_html)
    index_html = index_html.replace(
        "EXAMPLE_NAMES", ", ".join(repr(x) for x in sorted(example_names))
    )
    assets["index.html"] = index_html
    #
    license_html = md2html(assets["license.md"])
    license_html = HTML_TEMPLATE.replace("HTML", license_html)
    license_html = license_html.replace("TITLE", "FAQ-div license")
    assets["license.html"] = license_html

    return assets


asset_handler = asgineer.utils.make_asset_handler(collect_assets())


# %% Serving

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
