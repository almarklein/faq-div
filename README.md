![preview](website/img/faqdiv-wide.png)

# FAQ-div - turn any div into a FAQ


FAQ-div is a small JS library that makes it very easy to create effective FAQ pages.


## How?

Write questions in `<h3>` elements, with the answers below.
```html
<h3> Question 1</h3>

Answer ...

<h3> Question 2</h3>

Answer ...

etc.

```

Add two lines of code :
```html
<script src='faq-div.min.js'></script>

...

<div class='faq-start'></div>

<h3> Question 1</h3>
...
```

Bam! A beautiful FAQ with awesome features! See https://faq-div.com for more info and examples.


## License

### Commercial license

If you want to use FAQ-div to develop non open sourced sites, themes, projects, and applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary. Which means, you won't have to change your whole application source code to an open source license. You can buy a license [here](https://faq-div.com).


### Open source license

If you are creating an open source application under a license compatible with the GNU GPL license v3, you may use FAQ-div under the terms of the GPLv3.

The credit comments in the JavaScript and CSS files should be kept intact (even after combination or minification).


### Developers

FAQ-div is implemented in vanilla JS. The tooling is mostly in Python
(because I'm primarily a Python dev). Tips:

* `python build.py`: generate `dist/faq-div.min.js`.
* `python build.py develop`: generate `dist/faq-div.min.js` continuously.
* `python serve.py`: build, then start a webserver for website and examples.
* `black .`: autoformat the Python code.
* `flake8 . --max-line-length=89`: linting the Python code.
* I use VS Code plugins to lint the JavaScript and CSS.

