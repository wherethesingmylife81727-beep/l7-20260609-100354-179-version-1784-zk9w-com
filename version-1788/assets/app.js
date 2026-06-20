(function () {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (button && menu) {
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
            button.textContent = open ? '×' : '☰';
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter(input) {
        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            card.classList.toggle('hidden-by-filter', query && text.indexOf(query) === -1);
        });
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

    filterInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            applyFilter(input);
        });
    });

    var queryInput = document.querySelector('[data-query-input]');

    if (queryInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        queryInput.value = q;
        applyFilter(queryInput);
    }
})();
