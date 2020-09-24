"""
Python script to serve the FAQ-div website and examples.

You may need to ``pp install uvicorn, asgineer, markdown jinja2 pygments``.
"""

import os
import json
import socket

import build

import asgineer
import markdown
import jinja2
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name


# %% Collect and generate assets


def md_highlight(text):
    """Apply syntax highlighting."""
    lines = []
    code = []
    for i, line in enumerate(text.splitlines()):
        if line.startswith("```"):
            if code:
                formatter = HtmlFormatter()
                try:
                    lexer = get_lexer_by_name(code[0].strip())
                except Exception:
                    lexer = get_lexer_by_name("text")
                html = highlight("\n".join(code[1:]), lexer, formatter)
                lines.append(html)
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
    html = markdown.markdown(text2, extensions=[])
    return html


def collect_assets():
    # Collect
    this_dir = os.path.abspath(os.path.dirname(__file__))
    assets = {}
    examples = []
    for subdir in ("", "src", "dist", "website", "examples", "website/img"):
        fulldir = os.path.join(this_dir, subdir) if subdir else this_dir
        for fname in os.listdir(fulldir):
            filename = os.path.join(fulldir, fname)
            if not os.path.isfile(filename):
                continue
            elif fname.endswith((".md", ".html", ".js", ".css")):
                with open(filename, "rb") as f:
                    assets[fname] = f.read().decode()
                if subdir == "examples" and fname.endswith(".html"):
                    examples.append(fname[:-5])
            elif fname.endswith((".png", ".jpg", ".ico", ".svg")):
                with open(filename, "rb") as f:
                    assets[fname] = f.read()

    # Collect blog pages
    template = jinja2.Template(assets["template.html"])
    blogpages = {}
    for fname in os.listdir(os.path.join(this_dir, "website", "blog")):
        if fname.endswith(".md"):
            fname2 = "blog/" + fname[:-3] + ".html"
            with open(os.path.join(this_dir, "website", "blog", fname), "rb") as f:
                text = f.read().decode()
            title = text.splitlines()[0].strip("#").strip()
            date = text.split("-- DATE:")[1].split("--")[0].strip()
            assert len(date) == 10
            blogpages[date] = fname2, title
            assets[fname2] = template.render(
                title="FAQ-div blog: " + title,
                header_image="faqdiv-blog.png",
                content=md2html(text),
            )
    html = "<h2>Pages</h2>\n\n"
    for date in sorted(blogpages.keys(), reverse=False):
        fname, title = blogpages[date]
        html += f"<a href='/{fname}'>{title}</a><br />\n"
    assets["blog"] = template.render(
        title="FAQ-div blog",
        header_image="faqdiv-blog.png",
        content=html,
    )
    assets["blog/"] = assets["blog"]  # aliases

    # Generate sitemap
    sitemap = ["", "blog"] + [fname for fname, title in blogpages.values()]
    sitemap = ["https://faq-div.com/" + x for x in sitemap]
    assets["sitemap.txt"] = "\n".join(sitemap)

    # Generate robots.txt
    robots = [
        "Sitemap: https://faq-div.com/sitemap.txt",
        "User-agent: *",
        "Allow: /",
        "",
    ]
    assets["robots.txt"] = "\n".join(robots)

    # Post processing
    index_template = jinja2.Template(assets["index.html"])
    assets["index.html"] = index_template.render(
        example_names=", ".join(repr(x) for x in sorted(examples)),
        faq=md2html(assets["faq.md"]),
    )
    #
    assets["license_commercial.html"] = template.render(
        title="FAQ-div license",
        header_image="faqdiv-wide.png",
        content=md2html(assets["license_commercial.md"]),
    )
    return assets


build.main()
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


def main():
    asgineer.run(main_handler, "uvicorn", "0.0.0.0:80", log_level="warning")


if __name__ == "__main__":
    main()
