### How do I add a FAQ to my website?

Start writing your questions in `<h3>` headers, and your answers below.
The answer can be (a series of) paragraphs, images ... anything.


### How do I apply FAQ-div?

There's two ways. The first is to put the HTML of your questions and answers in a div that has the class "faq":

```html
    <div class='faq'>
        <h3> Question 1 </h3>
        ...
        <h3> Question 2 </h3>
        ...
    </div>
```

The other is to the HTML in between two empty divs marked as "faq-start" and "faq-end".
If the "faq-end" is omitted, all elements (within the parent element) are consumed.

```html
    <div class='faq-start'></div>
    <h3> Question 1 </h3>
    ...
    <h3> Question 2 </h3>
    ...
    <div class='faq-end'></div>
```


### How can I configure my FAQ?

Configurarion is done using the `data` attributes, e.g.:
```
<div class='faq' data-collapse='false'>
```

These are the configuration opions:

* `data-collapse`: set to "false" to show q&a items uncollapsed. Default is "true".
* `data-link`: set to "false" to not show the link icon when hovering over the question.
* `data-search`: set to "false" to hide the search element. Default is "true".
* `data-search-placeholder`: custimize the placeholder text in the search input box.
* `data-search-info`: this string is displayed when the user does a search.
  The text "COUNT" is replaced with the search count, and the text "SEARCH" is replaced with
  the current text in the search box. You can use this to customize for other languages,
  but also to e.g. display a mailto link.


### How can I style my FAQ?

The root element has classname `faq`. (If you use a `faq-start` div, the content is moved into the start div, and that div gets an additional `faq` class name.)

Inside the root element, the Q&A items are wrapped into divs with classname `qa`.
In short, here are the CSS queries of interest:

* `.faq > .qa`: A Q&A item.
* `.faq > .qa.collapsible`: When the items can be collapsed.
* `.faq > .qa.collapsed`: When the item is collapsed.
* `.faq > .qa.hidden`: When the item is hidden (e.g. during a search).
* `.faq > .qa > h3`: The question/title of each item.
* `.faq > .qa > h3 > .collapse-icon`: The collapse/expand icon.
* `.faq > .qa > h3 > .link-icon`: The link icon.
* `.faq > input.search`: The search input element.
* `.faq > .search-info`: A div where search info is displayed.

For the `collapse-icon` and `link-icon`, the `::before` CSS selector is used
to set the Unicode char for the icon.

Also see the examples.


### Can I create sections in my FAQ?

Yes, you can use `<h1>`, `<h2>` and `<hr>` elements to create a section.
Everything below such element is considered part of the "section divider", until an `<h3>` is encountered again.


### How does linking work?

Next to each question is an icon that can be clicked to change the browser url to the question's anchor.
This url can be copied and used in links to that specific question.

You can also use `https://example.com#faq:a-specific-search` to link to the FAQ and directly initiating a search.
(In case the page has multiple FAQ's, use e.g. prefix `faq1:` to target the right FAQ.)

Linking can be disabled using `<div class='faq' data-link='false'>`.


### Does FAQ-div play well with Markdown?

Absolutely! This is why we have the option enclose your questions and answers with faq-start and faq-end divs.
Because you can use plain HTML in Markdown (although not use markdown <i>inside</i> such HTML), this just works:

```html
    <div class='faq-start'></div>
    ### Question 1
    ...
    ### Question 2
    ...
    <div class='faq-end'></div>
```


### Can I create multiple FAQ's on a single page?

Yes, you could; FAQ-div is designed to deal with such scenarios.


### What if my content is injected after page load?

No worries! You can trigger FAQ-div using `window.faqdiv.init()`.


### What browsers are supported by FAQ-div?

FAQ-div is fully functional on all modern browsers (desktop and mobile). It
may not work on older browsers (like Internet explorer). When it does not work,
the FAQ is just `<h3>`'s and `<p>`'s, which is a pretty good fallback.

