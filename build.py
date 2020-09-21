"""
Python script to minify the code. Call with ``python build.py develop``
to continuously build the sources.

You may need to ``pip install jsmin``.
"""

import os
import sys
import time

from jsmin import jsmin


preamble = """
/* Copyright 2019-2020 Almar Klein. You need a license to use FAQ-div. Do not remove this comment. */
""".lstrip()


def wordgen():
    # This can generate up to 28 * 28 * 27 -> over 20k words.
    alphabet = tuple("abcdefghijklmnopqrstuvwxyz")
    alphebet_plus_empty = ("",) + tuple(alphabet)
    for pre1 in alphebet_plus_empty:
        for pre2 in alphebet_plus_empty:
            for c in alphabet:
                yield pre1 + pre2 + c


def remove_comments_and_trailing_ws(text):
    lines = text.splitlines()
    lines = [line.split("//")[0].strip() for line in lines]
    lines = [line for line in lines if line]
    return "\n".join(lines)


def rename_variabes_js(text):
    # Note that this breaks on multi-line comments

    words = {}
    words_that_can_be_renamed = set()

    # First examine all words
    word_start = None
    next_word_is_var_definition = False
    in_something = None
    for i, c in enumerate(text):
        if in_something is not None:
            # In a string or comment, see if this char ends it
            if c == in_something:
                in_something = None
        elif word_start is not None:
            # In a word, see if this char ends it
            if not (c == "_" or c.isalnum()):
                word = text[word_start:i]
                if word in ("var", "let", "function"):
                    next_word_is_var_definition = i
                else:
                    words.setdefault(word, []).append((word_start, i))
                    if next_word_is_var_definition == word_start - 1:
                        words_that_can_be_renamed.add(word)
                    next_word_is_var_definition = False
                word_start = None
        else:
            if c == "_" or c.isalpha():
                if not (i > 0 and text[i - 1] == "."):
                    word_start = i
            elif c == "'":
                in_something = "'"
            elif c == '"':
                in_something = '"'
            elif c == "/" and i > 0 and text[i - 1] == "/":
                in_something = "\n"

    # Some words are protected
    protected = "css", "version"
    for word in protected:
        words_that_can_be_renamed.discard(word)

    # Collect all replacements
    new_words = wordgen()
    replacements = []
    for word, occurances in words.items():
        if word in words_that_can_be_renamed:
            new_word = new_words.__next__()
            for i1, i2 in occurances:
                replacements.append((i1, i2, new_word))

    # Sort the replacements and apply them
    replacements.sort(reverse=True)
    for i1, i2, new_word in replacements:
        text = text[:i1] + new_word + text[i2:]

    return text


def minify_js(text):
    text = remove_comments_and_trailing_ws(text)
    text = rename_variabes_js(text)
    text = jsmin(text)
    return text


def minify_css(text):
    text = remove_comments_and_trailing_ws(text)
    text = text.replace("\n", " ")
    text = text.replace("{ ", "{").replace(" }", "}").replace(" {", "{")
    text = text.replace(": ", ":").replace(", ", ",").replace("; ", ";")
    text = text.replace(" > ", ">")
    text = text.replace('"', "'")  # for consistency and embedding
    return text


last_result = ""


def main():
    global last_result

    css_ori = open("src/faq-div.css", "rb").read().decode()
    css = minify_css(css_ori)

    js_ori = open("src/faq-div.js", "rb").read().decode()
    js = minify_js(js_ori)

    minified = (
        preamble
        + "(function() {\n"
        + js.replace('css="";', f'css="{css}";\n')
        + "\n})();"
    )

    if minified == last_result:
        return

    last_result = minified

    print(
        f"Minimizing: original css and js are {len(css_ori)}+{len(js_ori)}"
        + f"={len(js_ori) + len(css_ori)} chars. Minified: {len(minified)}"
    )

    with open("dist/faq-div.min.js", "wb") as f:
        f.write(minified.encode())


if __name__ == "__main__":
    if "help" in sys.argv or "-h" in sys.argv or "--help" in sys.argv:
        print(__doc__)
    elif "develop" in sys.argv:
        while True:
            main()
            time.sleep(1)
    else:
        main()
