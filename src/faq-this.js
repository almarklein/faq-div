// When minified, this whole code gets wrapped into a function to avoid variable leakage.
// Also, the CSS variable gets inserted.

var version = "1.1";
var CSS = "";

window.addEventListener("load", function() {
    // Include CSS
    if (!document.getElementById("faq-this-css")) {
        let css_element = document.createElement('style');
        css_element.type = "text/css";
        css_element.id = "faq-this-css";
        css_element.innerText = CSS;
        let added = false;
        for (let child of document.head.children) {
            if (child.nodeName == "LINK") {
                document.head.insertBefore(css_element, child);
                added = true;
                break;
            }
        }
        if (!added) {document.head.prepend(css_element);}
    }
    // Detect faq divs
    var funcs = [];
    for (let el of document.getElementsByClassName("faq-this")) {
        funcs.push(faq_this_div(el));
    }
    for (let el of document.getElementsByClassName("faq-this-start")) {
        funcs.push(faq_this_div(el));
    }
    function when_has_changes() {
        var hash = location.hash.slice(1);
        if (hash) {
            for (let f of funcs) {
                if (f(hash)) { break; }
            }
        }
    }
    window.addEventListener("hashchange", when_has_changes);
    when_has_changes();
    if (location.hash.startsWith("#faq-search=")) {
        location.hash = '';
    }
});


function toggle(headernode) {
    // Global function to toggle the visibility of a q/a.
    var node = headernode.parentNode; //e.target.parentNode;
    node.classList.remove("hidden");
    if (node.classList.contains("hiddenanswer")) {
        node.classList.remove("hiddenanswer");
    } else {
        node.classList.add("hiddenanswer");
    }
}

function faq_this_div(ref_node, detect_start_end) {
    // Global function to setup a FAQ from a parent- or start-node
    // Returns func ensure_visible().

    // We use the dataset feature: data-xx fields are available as config.xx
    var config = ref_node.dataset;

    function search() {
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
            search_result_node.innerHTML = "";
            search_info_node.innerHTML = "";
            for (let hash in index) {
                let qa = index[hash];
                qa.node.classList.remove('hidden');
                qa.node.classList.add('hiddenanswer');
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
            // Show link to send email
            search_info_node.innerHTML = "";
            if (config.email) {
                let preamble = "If you can't find what you're looking for, just ";
                let elink = "<a href='mailto:EMAIL?subject=SUBJECT'>ask us!</a>";
                elink = elink.replace("EMAIL", config.email).replace("SUBJECT", search_node.value);
                search_info_node.innerHTML = preamble + elink + " (via " + config.email + ").<br>";
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
            search_result_node.innerHTML = "";
            for (let i=0; i<questions.length; i++) {
                let hits = questions[i][0];
                let node = questions[i][1];
                node.classList.add('hidden');
                if (hits > 0 && i < 16) {
                    let node2 = node.cloneNode(true);
                    search_result_node.appendChild(node2);
                    if (i < 5) {
                        node2.classList.remove('hidden');
                        node2.classList.remove('hiddenanswer');
                    } else {
                        node2.classList.remove('hidden');
                        node2.classList.add('hiddenanswer');
                    }
                }
            }
            if (search_result_node.children.length == 0) {
                search_info_node.innerHTML = 'No results ... ' + search_info_node.innerHTML;
            }
        }
    }  // end of search()

    function ensure_visible(hash) {
        var qa = index[hash];
        if (typeof qa != 'undefined') {
            qa.node.classList.remove("hidden");
            qa.node.classList.remove("hiddenanswer");
            highlight_element(qa.node);
            return true;
        } else if (hash.startsWith("faq-search=")) {
            search_node.value = hash.split("=", 2)[1];
            search();
            return false;
        } else {
            return false;
        }
    }  // end of ensure_visible()

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

    // Collect each h3 with following p's (or ul's)

    // Prepare
    var sections = [[null]];
    var index = {};
    // todo: DEBUGGING
    window.sections = sections;
    window.index = index;
    //
    var node = ref_node.children[0];
    if (ref_node.classList.contains("faq-this-start")) {
        ref_node.classList.add("faq-this");
        node = ref_node;
    }
    // Walk the DOM
    while (node.nextElementSibling) {
        node = node.nextElementSibling;
        var node_type = node.nodeName.toLowerCase();
        if (node.classList.contains("faq-this-end")) {
            break;
        } else if (node_type == "h3") {
            // Get hash for this question
            var hash = '';
            for (let c of node.innerText.toLowerCase().replace(new RegExp("\ ", 'g'), "-")) {
                if ("abcdefghijklmnopqrstuvwxyz_-".indexOf(c) >= 0) {
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
            index[hash] = {hash: hash};
            sections.push([hash, node]);
        } else if (node_type == "h2" || node_type == "h1" || node_type == "hr") {
            sections.push([null, node]);  // no hash
        } else {
            sections[sections.length-1].push(node);
        }
    }

    // Build index
    for (let s of sections) {
        let hash = s[0];
        if (hash !== null) {
            index[hash].headertext = s[1].innerText.toLowerCase();
            index[hash].text = "";
            for (let j=2; j<s.length; j++) {
                index[hash].text += s[j].innerText.toLowerCase() + "\n";
            }
        }
    }


    // Clear the div
    ref_node.innerHTML = "";

    // Add search bar
    var search_wrapper_node = document.createElement("div");
    search_wrapper_node.className = "search-container";
    var search_node = document.createElement("input");
    var search_info_node = document.createElement("div");
    search_info_node.style.fontSize = "90%";
    search_node.setAttribute("type", "text");
    search_node.setAttribute("placeholder", "How can I ...");
    search_node.addEventListener("input", search);
    search_node.className = "search";
    search_wrapper_node.appendChild(search_node);
    search_wrapper_node.appendChild(search_info_node);
    ref_node.appendChild(search_wrapper_node);
    var search_result_node = document.createElement("div");
    ref_node.appendChild(search_result_node);

    // Write back the sections
    for (let s of sections) {
        let hash = s[0];
        if (hash !== null) {
            // Add the h2 node plus p nodes, but tweak a bit
            var wrapper_node = document.createElement("div");
            wrapper_node.classList.add("qa-container");
            wrapper_node.classList.add("hiddenanswer");
            wrapper_node.setAttribute("id", hash);
            var link_node = document.createElement("a");
            link_node.innerHTML = "get link / share";
            link_node.className = "sharelink";
            link_node.setAttribute("href", "#" + hash);
            var header_node = s[1];
            header_node.setAttribute("onclick", "faq_this.toggle(this);");
            wrapper_node.appendChild(header_node);
            for (let j=2; j<s.length; j++) { wrapper_node.appendChild(s[j]); }
            wrapper_node.appendChild(link_node);
            ref_node.appendChild(wrapper_node);
            index[hash].node = wrapper_node;
        } else {
            // Just add the original nodes
            for (let j=1; j<s.length; j++) {
                ref_node.appendChild(s[j]);
            }
        }
    }
    return ensure_visible;
}  // end of faq_this_div()

// Set global
window.faq_this = {"version": version, "toggle": toggle};
