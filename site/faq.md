
## Usage

### How should I write my FAQ?

The only constraint for the HTML of your FAQ is that the questions are `<h3>` headers.
If you use an editor, this is probably something like the "heading 3" format. In
markdown this is `### a heading`.

The answers to the questions are usually formatted with paragraphs
(`<p>`), but any other elements (e.g. images) can also be used.


### How do I load the FAQ-div library on my page?

Download the FAQ-div lib and add it to your website's assets, then add
the following HTML anywhere on your page (preferably in the head section):

```html
<script src='faq-div.js'></script>
```

Alternatively, you can copy the source code and include the source directly:

```html
<script>
...
</script>
```

At the moment, FAQ-div is not yet available via a CDN.


### How do I apply FAQ-div?

There are two possible ways to apply FAQ-div. The practical approach
is to add empty divs marked as "faq-start" and "faq-end", surrounding
the content of your FAQ:

```html
    <div class='faq-start'></div>
    <h3> Question 1 </h3>
    ...
    <h3> Question 2 </h3>
    ...
    <div class='faq-end'></div>
```

This approach is flexible, and e.g. works well with Markdown. The
"faq-end" can be omitted, in which case all following elements (within
the parent element) are converted.

The other approach is perhaps more natural (from a developer point of view),
but it requires a change to the structure of the HTML. Wrap the content
of your FAQ in a div that has the class "faq":

```html
    <div class='faq'>
        <h3> Question 1 </h3>
        ...
        <h3> Question 2 </h3>
        ...
    </div>
```


### How can I configure my FAQ?

Configurarion is done using the `data` attributes, e.g.:
```
<div class='faq' data-collapse='false'>
```

These are the configuration opions:

* `data-collapse`: set to "false" to show q&a items uncollapsed. Default is "true".
* `data-link`: set to "false" to not show the link icon when hovering over the question. Default is "true".
* `data-search`: set to "false" to hide the search element. Default is "true".
* `data-search-placeholder`: customize the placeholder text in the search input box.
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
* `.faq > .qa > h3`: The question/title of an item.
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



## Compatibility


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



### What browsers are supported by FAQ-div?

FAQ-div is fully functional on all modern browsers (desktop and mobile). It
may not work on older browsers (like Internet explorer). When it does not work,
the FAQ is just `<h3>`'s and `<p>`'s, which is a pretty good fallback.


### How does it work?

On page load, FAQ-div will select elements with the class "faq" and "faq-start",
collect the content of your FAQ, and restructure the DOM accordingly.

In this process, it also builds an index for the search functionality.
The search is performed by smart matching of the query against this
index. The rest is mostly CSS.


### What if my content is created after page load?

No worries! You can trigger FAQ-div using `window.faqdiv.init()`.
It's safe to call it multiple times.


## License and payments

### Can I try FAQ-div before buying it?

Yes, you can download it, and play with it as long as you like.

But as soon as you make it part of any kind of deployment (something
other people can see), then you will have to purchase the appropriate
license.

### Is this a one-time payment or a recurring subscription?

The FAQ-div license is obtained as a one-time payment. The license gives you a
life-long right to use the current version, plus updates for one year.

### Can I use FAQ-div for commercial products?

Yes, but you'll need to purchase a license.

### Do I need to purchase a license for open source projects?

Yes, a license is required for any product that uses FAQ-div and is (potentially) used by more than one person.

### What about support?

When you purchase a license you have a right to email support. The business license gives priority support.
For support requests, contact me at `almar AT almarklein.org`.

### Do you offer refunds?

No, you can try FAQ-div in advance. Therefore a purchase is final.

### Can I add my company VAT number?

Yes, you can provide your company VAT number during checkout.
The invoice will be updated accordingly.


### Can I pay via wire transfer?

We make use of Gumroad to handle payments and invoicing. Gumroad supports
creditcard and Paypal.
If this is not an option for you or your company,
contact me at `almar AT almarklein.org`, so we can arrange for a wire transfer (you
will still get an invoice).
