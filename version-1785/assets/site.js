(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterList = document.querySelector("[data-filter-list]");
    if (filterInput && filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
        filterInput.addEventListener("input", function () {
            var value = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                card.classList.toggle("is-filtered", value && haystack.indexOf(value) === -1);
            });
        });
    }

    var globalForm = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-search-results]");
    if (globalForm && results && window.siteSearchData) {
        function render(value) {
            var keyword = value.trim().toLowerCase();
            if (!keyword) {
                results.classList.remove("is-open");
                results.innerHTML = "";
                return;
            }
            var matches = window.siteSearchData.filter(function (item) {
                return item.keywords.toLowerCase().indexOf(keyword) !== -1;
            }).slice(0, 24);
            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                    '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>' +
                    '</a>';
            }).join("");
            results.classList.toggle("is-open", matches.length > 0);
        }

        globalForm.addEventListener("submit", function (event) {
            event.preventDefault();
            render(globalForm.elements.q.value);
        });
        globalForm.elements.q.addEventListener("input", function () {
            render(globalForm.elements.q.value);
        });
    }
}());
