(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    window.clearInterval(timer);
                    show(index);
                    start();
                });
            });

            show(0);
            start();
        }

        var filterPanel = document.querySelector('[data-filter-panel]');
        if (filterPanel) {
            var input = filterPanel.querySelector('[data-filter-input]');
            var categorySelect = filterPanel.querySelector('[data-filter-category]');
            var typeSelect = filterPanel.querySelector('[data-filter-type]');
            var regionSelect = filterPanel.querySelector('[data-filter-region]');
            var yearSelect = filterPanel.querySelector('[data-filter-year]');
            var clearButton = filterPanel.querySelector('[data-filter-clear]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
            var emptyState = document.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);

            if (input && params.get('q')) {
                input.value = params.get('q');
            }
            if (categorySelect && params.get('category')) {
                categorySelect.value = params.get('category');
            }
            if (typeSelect && params.get('type')) {
                typeSelect.value = params.get('type');
            }
            if (regionSelect && params.get('region')) {
                regionSelect.value = params.get('region');
            }
            if (yearSelect && params.get('year')) {
                yearSelect.value = params.get('year');
            }

            function applyFilters() {
                var keyword = normalize(input && input.value);
                var category = normalize(categorySelect && categorySelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var region = normalize(regionSelect && regionSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var blob = normalize(card.getAttribute('data-search'));
                    var match = true;

                    if (keyword && blob.indexOf(keyword) === -1) {
                        match = false;
                    }
                    if (category && normalize(card.getAttribute('data-category')) !== category) {
                        match = false;
                    }
                    if (type && normalize(card.getAttribute('data-type')) !== type) {
                        match = false;
                    }
                    if (region && normalize(card.getAttribute('data-region')) !== region) {
                        match = false;
                    }
                    if (year && normalize(card.getAttribute('data-year')) !== year) {
                        match = false;
                    }

                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });

                if (emptyState) {
                    emptyState.hidden = visible !== 0;
                }
            }

            [input, categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            });

            if (clearButton) {
                clearButton.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    [categorySelect, typeSelect, regionSelect, yearSelect].forEach(function (select) {
                        if (select) {
                            select.value = '';
                        }
                    });
                    applyFilters();
                });
            }

            applyFilters();
        }
    });
})();
