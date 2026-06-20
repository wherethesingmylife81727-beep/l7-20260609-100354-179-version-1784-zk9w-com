(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(text) {
        return String(text || '').trim().toLowerCase();
    }

    function initMissingImageFallbacks() {
        document.querySelectorAll('.image-frame img').forEach(function (image) {
            image.addEventListener('error', function () {
                var frame = image.closest('.image-frame');
                if (frame) {
                    frame.classList.add('is-missing');
                }
            }, { once: true });
        });
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            var isOpen = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
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

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

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

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initHeaderSearch() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    var action = form.getAttribute('action') || './search.html';
                    window.location.href = action;
                }
            });
        });
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var list = document.querySelector('[data-filter-list]');
        if (!panel || !list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var category = panel.querySelector('[data-filter-category]');
        var count = panel.querySelector('[data-result-count]');
        var empty = document.querySelector('[data-empty-state]');

        var params = new URLSearchParams(window.location.search);
        if (keyword && params.get('q')) {
            keyword.value = params.get('q');
        }
        if (category && params.get('category')) {
            category.value = params.get('category');
        }

        function applyFilters() {
            var q = normalize(keyword && keyword.value);
            var selectedYear = normalize(year && year.value);
            var selectedType = normalize(type && type.value);
            var selectedRegion = normalize(region && region.value);
            var selectedCategory = normalize(category && category.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.dataset.search + ' ' + card.dataset.title);
                var matchesKeyword = !q || haystack.indexOf(q) !== -1;
                var matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
                var matchesType = !selectedType || normalize(card.dataset.type) === selectedType;
                var matchesRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
                var matchesCategory = !selectedCategory || normalize(card.dataset.category) === selectedCategory;
                var show = matchesKeyword && matchesYear && matchesType && matchesRegion && matchesCategory;

                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '共 ' + visible + ' 部';
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [keyword, year, type, region, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var source = player.dataset.src;
            var video = player.querySelector('video');
            var trigger = player.querySelector('.play-trigger');
            var message = player.querySelector('[data-player-message]');
            var hlsInstance = null;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.add('is-visible');
            }

            function loadAndPlay() {
                if (!source || !video) {
                    showMessage('未找到可用播放源。');
                    return;
                }

                player.classList.add('is-playing');

                if (hlsInstance) {
                    video.play().catch(function () {});
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.play().catch(function () {
                        showMessage('浏览器阻止了自动播放，请再次点击播放器播放。');
                    });
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            showMessage('浏览器阻止了自动播放，请再次点击播放器播放。');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage('播放源加载失败，请刷新页面后重试。');
                        }
                    });
                    return;
                }

                showMessage('当前浏览器不支持 m3u8 播放，请使用支持 HLS 的浏览器。');
            }

            if (trigger) {
                trigger.addEventListener('click', loadAndPlay);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!player.classList.contains('is-playing')) {
                        loadAndPlay();
                    }
                });
            }
        });
    }

    ready(function () {
        initMissingImageFallbacks();
        initMobileMenu();
        initHeroSlider();
        initHeaderSearch();
        initFilters();
        initPlayers();
    });
})();
