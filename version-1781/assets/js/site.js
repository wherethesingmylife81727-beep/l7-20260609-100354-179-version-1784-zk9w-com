(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var railItems = qsa('[data-hero-rail]');
    var next = qs('[data-hero-next]');
    var prev = qs('[data-hero-prev]');
    var index = 0;
    var timer;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      railItems.forEach(function (item, i) {
        item.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    railItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        show(Number(item.getAttribute('data-hero-rail')) || 0);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initCardFilter() {
    var searchInput = qs('.js-card-search');
    var chips = qsa('[data-filter-value]');
    var selects = qsa('.js-filter-select');
    var count = qs('[data-filter-count]');
    var cards = qsa('.movie-card');
    var quickFilter = '';

    if (!cards.length) {
      return;
    }

    function selectedYear() {
      var yearSelect = selects.find(function (select) {
        return select.getAttribute('data-filter') === 'year';
      });
      return yearSelect ? yearSelect.value : '';
    }

    function matchesYear(card, year) {
      if (!year) {
        return true;
      }
      var value = card.getAttribute('data-year') || '';
      if (year === '2022') {
        var numeric = parseInt(value, 10);
        return numeric && numeric <= 2022;
      }
      return value === year;
    }

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = selectedYear();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passQuick = !quickFilter || haystack.indexOf(quickFilter.toLowerCase()) !== -1;
        var passYear = matchesYear(card, year);
        var isVisible = passQuery && passQuick && passYear;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部内容';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        quickFilter = chip.getAttribute('data-filter-value') || '';
        applyFilter();
      });
    });

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });

    applyFilter();
  }

  function initPlayers() {
    qsa('.js-player').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('.player-overlay', player);
      var src = player.getAttribute('data-video-src');
      var hlsInstance = null;
      var isPrepared = false;

      if (!video || !src) {
        return;
      }

      function prepare() {
        if (isPrepared) {
          return;
        }
        isPrepared = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function play() {
        prepare();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (!isPrepared) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHeroCarousel();
    initCardFilter();
    initPlayers();
  });
})();
