/* Copyright 2019 Almar Klein. You need a license to use faq-it.js and faq-it.css. */

// todo: review class names



window.addEventListener("load", function() {
    var funcs = [];
    for (var el of document.getElementsByClassName("faq-this")) {
        funcs.push(faq_this_div(el));
    }
    for (var el of document.getElementsByClassName("faq-this-start")) {
        funcs.push(faq_this_div(el));
    }
    function when_has_changes() {
        var hash = location.hash.slice(1);
        if (hash) {
            for (var f of funcs) {
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


function faq_this_toggle(headernode) {
    var node = headernode.parentNode; //e.target.parentNode;
    node.classList.remove("hidden");
    if (node.classList.contains("hiddenanswer")) {
        node.classList.remove("hiddenanswer");
    } else {
        node.classList.add("hiddenanswer");
    }
}


function faq_this_div(ref_node, detect_start_end) {

    function search() {
        // Get search text (our "needle"), in parts
        var fullneedle = search_node.value.toLowerCase();
        var parts = [];
        for (var p of fullneedle.split(" ")) {
            if (p.length > 0) { parts.push(p); }
        }
        // Collect each consecutive combination of words
        var needles = [];
        for (var i1=0; i1<=parts.length; i1++) {
            for (var i2=i1+1; i2<=parts.length; i2++) {
                needles.push([i2 - i1, parts.slice(i1, i2).join(" ")]);
            }
        }
        needles.sort(function (a, b) {return b[0] - a[0];});

        if (needles.length == 0) {
            // No search - show all
            search_result_node.innerHTML = "";
            for (var hash in index) {
                var qa = index[hash];
                qa.node.classList.remove('hidden');
                qa.node.classList.add('hiddenanswer');
            }
            // Show in-between nodes too
            for (var s of sections) {
                if (s[0] === null) {
                    for (var j=1; j<s.length; j++) {
                        s[j].classList.remove('hidden');
                    }
                }
            }
        } else {
            // Hide in-between nodes
            for (var s of sections) {
                if (s[0] === null) {
                    for (var j=1; j<s.length; j++) {
                        s[j].classList.add('hidden');
                    }
                }
            }
            // Rate each question
            var questions = [];
            for (var hash in index) {
                var qa = index[hash];
                var hits = 0;
                for (var i=0; i<needles.length; i++) {
                    var c = needles[i][0];  // count
                    var n = needles[i][1];  // needle text
                    if (qa.headertext.indexOf(n) >= 0) {
                        hits += 5 * c;
                    }
                    if (qa.text.indexOf(n) >= 0) {
                        hits += 1 * c;
                    }
                }
                questions.push([hits, qa.node]);
            }
            questions.sort(function (a, b) { return b[0] - a[0] });
            // Show questions
            search_result_node.innerHTML = "";
            for (var i=0; i<questions.length; i++) {
                var hits = questions[i][0];
                var node = questions[i][1];
                node.classList.add('hidden');
                if (hits > 0 && i < 16) {
                    var node2 = node.cloneNode(true);
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
        }
    }

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
    }

    // Collect each h3 with following p's (or ul's)
    var sections = [[null]];
    var index = {};

    // DEBUGGING
    window.sections = sections;
    window.index = index;

    var node = ref_node.children[0];
    if (ref_node.classList.contains("faq-this-start")) {
        ref_node.classList.add("faq-this");
        node = ref_node;
    }

    while (node.nextElementSibling) {
        node = node.nextElementSibling;
        var node_type = node.nodeName.toLowerCase();
        if (node.classList.contains("faq-this-end")) {
            break;
        } else if (node_type == "h3") {
            // Get hash for this question
            var hash = '';
            for (var c of node.innerText.toLowerCase().replace(new RegExp("\ ", 'g'), "-")) {
                if ("abcdefghijklmnopqrstuvwxyz_-".indexOf(c) >= 0) {
                    hash = hash + c;
                }
            }
            // Make sure it is unique
            var ori_hash = hash;
            for (var j=1; j<1000; j++) {
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
    for (var s of sections) {
        var hash = s[0];
        if (hash !== null) {
            index[hash].headertext = s[1].innerText.toLowerCase();
            index[hash].text = "";
            for (var j=2; j<s.length; j++) {
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
    search_node.setAttribute("type", "text");
    search_node.setAttribute("placeholder", "Search FAQ ...");
    search_node.addEventListener("input", search);
    search_node.className = "search";
    search_wrapper_node.appendChild(search_node);
    ref_node.appendChild(search_wrapper_node);
    var search_result_node = document.createElement("div");
    ref_node.appendChild(search_result_node);

    // Write back the sections
    for (var s of sections) {
        var hash = s[0];
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
            header_node.setAttribute("onclick", "faq_this_toggle(this);");
            wrapper_node.appendChild(header_node);
            for (var j=2; j<s.length; j++) { wrapper_node.appendChild(s[j]); }
            wrapper_node.appendChild(link_node);
            ref_node.appendChild(wrapper_node);
            index[hash].node = wrapper_node;
        } else {
            // Just add the original nodes
            for (var j=1; j<s.length; j++) {
                ref_node.appendChild(s[j]);
            }
        }
    }
    return ensure_visible;
}
