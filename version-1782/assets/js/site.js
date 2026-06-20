
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');

        if (menuButton && panel) {
            menuButton.addEventListener('click', function () {
                var isOpen = document.body.classList.toggle('menu-open');
                panel.hidden = !isOpen;
                menuButton.setAttribute('aria-expanded', String(isOpen));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var previous = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function setSlide(index) {
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

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5600);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                restartHero();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                setSlide(current - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                restartHero();
            });
        }

        startHero();

        document.querySelectorAll('.rail-wrap').forEach(function (wrap) {
            var rail = wrap.querySelector('[data-rail]');
            var prev = wrap.querySelector('[data-rail-prev]');
            var nextButton = wrap.querySelector('[data-rail-next]');

            if (!rail) {
                return;
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    rail.scrollBy({ left: -360, behavior: 'smooth' });
                });
            }

            if (nextButton) {
                nextButton.addEventListener('click', function () {
                    rail.scrollBy({ left: 360, behavior: 'smooth' });
                });
            }
        });

        var filterPanel = document.querySelector('[data-filter-panel]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-library-grid] .library-card'));

        if (filterPanel && cards.length) {
            var search = filterPanel.querySelector('[data-filter-search]');
            var region = filterPanel.querySelector('[data-filter-region]');
            var type = filterPanel.querySelector('[data-filter-type]');
            var genre = filterPanel.querySelector('[data-filter-genre]');
            var year = filterPanel.querySelector('[data-filter-year]');
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query && search) {
                search.value = query;
            }

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilter() {
                var text = normalize(search && search.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var genreValue = normalize(genre && genre.value);
                var yearValue = normalize(year && year.value);

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-year'),
                        card.textContent
                    ].join(' '));
                    var keep = true;

                    if (text && haystack.indexOf(text) === -1) {
                        keep = false;
                    }
                    if (regionValue && normalize(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
                        keep = false;
                    }
                    if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
                        keep = false;
                    }
                    if (genreValue && normalize(card.getAttribute('data-genre')).indexOf(genreValue) === -1) {
                        keep = false;
                    }
                    if (yearValue && normalize(card.getAttribute('data-year')).indexOf(yearValue) === -1) {
                        keep = false;
                    }

                    card.classList.toggle('is-hidden', !keep);
                });
            }

            [search, region, type, genre, year].forEach(function (item) {
                if (item) {
                    item.addEventListener('input', applyFilter);
                    item.addEventListener('change', applyFilter);
                }
            });

            applyFilter();
        }

        document.querySelectorAll('[data-share-title]').forEach(function (button) {
            button.addEventListener('click', function () {
                var title = button.getAttribute('data-share-title') || document.title;
                var url = window.location.href;

                if (navigator.share) {
                    navigator.share({ title: title, url: url }).catch(function () {});
                    return;
                }

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(function () {
                        button.textContent = '链接已复制';
                        window.setTimeout(function () {
                            button.textContent = '分享影片';
                        }, 1600);
                    });
                }
            });
        });
    });
})();
