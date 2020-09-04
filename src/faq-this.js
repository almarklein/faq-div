// When minified, this whole code gets wrapped into a function to avoid variable leakage.
// Also, the CSS variable gets inserted.

// We look for divs that have a classname "faq", and turn their child h3-p pairs into qa items.
// Alternatively, we hoist elements in between two divs which have classes "faq-start" and "faq-end", respectively.
// The faq-start element functions as normal faq element from there.

var version = "1.1";
var CSS = "";

// dict of faqs objects
var faqs = {};

window.addEventListener("load", init);
window.addEventListener("hashchange", when_hash_changes);

function init() {
    // Include CSS
    if (!document.getElementById("faq-this-css")) {
        let css_element = document.createElement('style');
        css_element.type = "text/css";
        css_element.id = "faq-this-css";
        css_element.innerText = CSS;
        let added = false;
        for (let child of document.head.children) {
            if (child.nodeName.toLowerCase() == "link") {
                document.head.insertBefore(css_element, child);
                added = true;
                break;
            }
        }
        if (!added) {document.head.prepend(css_element);}
    }
    // Detect faq starts, turn into normal faq divs
    var starts = [];
    for (let el of document.getElementsByClassName("faq-start")) {starts.push(el);}
    for (let el of starts) {
        if (el.children.length) {continue;}
        el.classList.add("faq");
        let nodes = [];
        let node = el.nextSibling;
        while (node && !(node.classList && (node.classList.contains("faq-start") || node.classList.contains("faq-end") || node.classList.contains("faq")))) {
            nodes.push(node);
            node = node.nextSibling;
        }
        for (let node of nodes) {el.append(node);}
    }
    // Turn faq divs into a proper faq :)
    var count = "";
    for (let el of document.getElementsByClassName("faq")) {
        if (el.children.length && !el.classList.contains("initialized")) {
            el.classList.add("initialized");
            faq_this_div(el, "faq" + count);
            count = Number(count) + 1;
        }
    }
    when_hash_changes();
}


function when_hash_changes() {
    // Delegate to the faq to which this applies
    let hash = location.hash;
    let i = hash.indexOf(":");
    if (i > 0 && hash.startsWith('#faq')) {
        let faq_id = hash.slice(1, i);
        let faq = faqs[faq_id];
        if (faq) { faq.onhash(hash.slice(i+1)); }
    }
}


var _highlighting = {};
function highlight_element(el, step) {
    if (typeof step == "undefined") { step = 0; }
    var wait = 1;
    if (step == 0) {
        el.style.transition = "none";
    } else if (step != _highlighting[el.id]) {
        return;
    } else if (step == 1) {
        el.classList.add("highlight");
    } else if (step == 2) {
        el.style.transition = null;
        wait = 1000;
    } else {
        el.classList.remove("highlight");
        delete _highlighting[el.id];
        return;
    }
    _highlighting[el.id] = step + 1;
    window.setTimeout(highlight_element, wait, el, step + 1);
}  // end of highlight_element()


function toggle(headernode) {
    // Global function to toggle the visibility of a q/a.
    var node = headernode.parentNode; //e.target.parentNode;
    node.classList.remove("hidden");
    if (node.classList.contains("collapsed")) {
        node.classList.remove("collapsed");
    } else if (node.classList.contains("collapsible")) {
        node.classList.add("collapsed");
    }
}


function faq_this_div(ref_node, faq_id) {
    // Global function to setup a FAQ from a parent faq node

    // We use the dataset feature: data-xx fields are available as config.xx
    var config = ref_node.dataset;

    // Register this faq in the module-level dict
    faqs[faq_id] = {"onhash": onhash};

    // Prepare
    var sections = [[null]];
    var index = {};

    // Create nodes for search
    var search_node = document.createElement("input");
    var search_info_node = document.createElement("div");
    search_info_node.classList.add("search-info");
    search_node.setAttribute("type", "text");
    search_node.setAttribute("placeholder", config.searchPlaceholder || "Search FAQ ...");  // 🔍
    search_node.addEventListener("input", search);
    search_node.className = "search";
    if (config.search == 'false') {search_node.style.display = 'none';}

    populate_sections();
    build_index();
    restructure();

    // ----- rest is functions -----

    function populate_sections() {
        // Walk the DOM
        var node = ref_node.children[0];
        while (node) {
            var node_type = node.nodeName.toLowerCase();
            if (node_type == "h3") {
                // Get hash for this question
                var hash = '';
                for (let c of node.innerText.toLowerCase().replace(new RegExp("\ ", 'g'), "-")) {
                    if ("abcdefghijklmnopqrstuvwxyz_-0123456789".indexOf(c) >= 0) {
                        hash = hash + c;
                    }
                }
                // Make sure it is unique
                var ori_hash = hash;
                for (let j=1; j<1000; j++) {
                    if (typeof index[hash] == 'undefined') {break; }
                    else { hash = ori_hash + j; }
                }
                // Add to index and sections
                index[hash] = {"hash": hash};
                sections.push([hash, node]);
            } else if (node_type == "h2" || node_type == "h1" || node_type == "hr") {
                sections.push([null, node]);  // no hash
            } else {
                let section = sections[sections.length-1];
                if (node.classList)  { // Is an element (e.g. <p> or <img>)
                    section.push(node);
                } else if (node.nodeName == "#text") {
                    // Support for text nodes -> wrap in a span
                    let text = node.textContent.trim();
                    if (text) {
                        if (section[section.length-1].nodeName.toLowerCase() != "span") {
                            section.push(document.createElement("span"));
                            if (section.length == 3) { text = "\n" + text;}
                        }
                        section[section.length-1].innerText += text + " ";
                    }
                }
            }
            node = node.nextSibling;
        }
    }

    function build_index() {
        for (let s of sections) {
            let hash = s[0];
            if (hash !== null) {
                index[hash].headertext = s[1].textContent.toLowerCase();
                index[hash].text = "";
                for (let j=2; j<s.length; j++) {
                    index[hash].text += s[j].textContent.toLowerCase() + "\n";
                }
            }
        }
    }

    function restructure() {
        // Clear
        ref_node.innerHTML = "";
        // Add search
        ref_node.appendChild(search_node);
        ref_node.appendChild(search_info_node);
        // Add the sections
        for (let s of sections) {
            let hash = s[0];
            if (hash !== null) {
                // Prep qa wrapper node
                var wrapper_node = document.createElement("div");
                wrapper_node.classList.add("qa");
                wrapper_node.setAttribute("id", hash);
                // Add the h2 node plus p nodes, but tweak a bit
                var header_node = s[1];
                wrapper_node.appendChild(header_node);
                for (let j=2; j<s.length; j++) { wrapper_node.append(s[j]); }
                // Add link?
                if (config.link != "false") {
                    var link_node = document.createElement("a");
                    link_node.innerHTML = " 🔗";  // 🔗¶
                    link_node.className = "qalink";
                    link_node.setAttribute("href", "#" + faq_id + ":" + hash);
                    link_node.setAttribute("onclick", "event.stopPropagation();");
                    index[hash].link_node = link_node;
                    header_node.appendChild(link_node);
                }
                // Collapsable?
                if (config.collapse != "false") {
                    wrapper_node.classList.add("collapsible");
                    wrapper_node.classList.add("collapsed");
                    header_node.setAttribute("onclick", "faqthis.toggle(this);");
                }
                // Done
                ref_node.appendChild(wrapper_node);
                index[hash].node = wrapper_node;
            } else {
                // Just add the original nodes
                for (let j=1; j<s.length; j++) {
                    ref_node.append(s[j]);  // not appendChild
                }
            }
        }
    }

    function clear_search_results () {
        var nodes = [];  // First collect nodes, then remove. Otherwise it wont work.
        for (let node of ref_node.getElementsByClassName('qa searchresult')) {
            nodes.push(node);
        }
        for (let node of nodes) {
            ref_node.removeChild(node);
        }
    }

    function onhash(hash) {
        var qa = index[hash];
        if (qa) {
            qa.node.classList.remove("hidden");
            qa.node.classList.remove("collapsed");
            highlight_element(qa.node);
            if (qa.link_node) {qa.link_node.focus();}
        } else if (hash) {
            search_node.value = hash.replace(new RegExp("-", 'g'), " ");
            search();
        }
    }

    function search() {
        var key = "ljbsdfaljhsbdkey"; // Can identify code from this
        // Get search text (our "needle"), in parts
        var fullneedle = search_node.value.toLowerCase().replace(",", "");
        var parts = [];
        for (let p of fullneedle.split(" ")) {
            if (p.length > 0) { parts.push(p); }
        }
        // Collect each consecutive combination of words
        // Ignore certain "sentences" (mind the surrounding space)
        var ignores = " how can i , and , or , is ";
        var needles = [];
        for (let i1=0; i1<=parts.length; i1++) {
            for (let i2=i1+1; i2<=parts.length; i2++) {
                let needle = parts.slice(i1, i2).join(" ");
                if (ignores.indexOf(" " + needle + " ") < 0) { needles.push([i2-i1, needle]); }
            }
        }
        needles.sort(function (a, b) {return b[0] - a[0];});

        if (needles.length == 0) {
            // No search - show all
            clear_search_results();
            search_info_node.innerHTML = "";
            for (let hash in index) {
                let qa = index[hash];
                qa.node.classList.remove('hidden');
                if (qa.node.classList.contains("collapsible")) {
                    qa.node.classList.add('collapsed');
                }
            }
            // Show in-between nodes too
            for (let s of sections) {
                if (s[0] === null) {
                    for (let j=1; j<s.length; j++) {
                        s[j].classList.remove('hidden');
                    }
                }
            }
        } else {
            // Hide nodes
            for (let hash in index) {
                let qa = index[hash];
                qa.node.classList.add('hidden');
                qa.node.classList.remove('collapsed');
            }
            // Hide in-between nodes
            for (let s of sections) {
                if (s[0] === null) {
                    for (let j=1; j<s.length; j++) {
                        s[j].classList.add('hidden');
                    }
                }
            }
            // Rate each question
            var questions = [];
            for (let hash in index) {
                let qa = index[hash];
                let hits = 0;
                for (let i=0; i<needles.length; i++) {
                    let count = needles[i][0];
                    let needle_text = needles[i][1];
                    if (qa.headertext.indexOf(needle_text) >= 0) {
                        hits += 5 * count;
                    }
                    if (qa.text.indexOf(needle_text) >= 0) {
                        hits += 1 * count;
                    }
                }
                questions.push([hits, qa.node]);
            }
            questions.sort(function (a, b) { return b[0] - a[0]; });
            // Show questions
            clear_search_results();
            var search_count = 0;
            for (let i=0; i<questions.length; i++) {
                let hits = questions[i][0];
                let node = questions[i][1];
                node.classList.add('hidden');
                if (hits > 0 && i < 16) {
                    let node2 = node.cloneNode(true);
                    node2.classList.add('searchresult');
                    ref_node.appendChild(node2);
                    search_count += 1;
                    node2.classList.remove('hidden');
                    if (node2.classList.remove('collapsible')) {
                        if (i < 5) {
                            node2.classList.remove('collapsed');
                        } else {
                            node2.classList.add('collapsed');
                        }
                    }
                }
            }
            let info = config.searchInfo || "COUNT results";
            search_info_node.innerHTML = info.replace("COUNT", search_count).replace("SUBJECT", search_node.value) + "<br>";
        }
    }  // end of search()

}  // end of faq_this_div()

// Set global
window.faqthis = {"version": version, "toggle": toggle, "init": init};
