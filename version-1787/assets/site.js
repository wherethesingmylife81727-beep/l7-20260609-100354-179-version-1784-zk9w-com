(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardMarkup(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card searchable-card">' +
        '<a class="movie-cover" href="' + movie.detail + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<a class="movie-card-title" href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;

      function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }
    }

    Array.prototype.slice.call(document.querySelectorAll('.js-search-form')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && input.value.trim()) {
          return;
        }
        if (input) {
          event.preventDefault();
          input.focus();
        }
      });
    });

    var filterInput = document.querySelector('[data-local-filter]');
    var cardContainer = document.querySelector('[data-card-container]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterInput && cardContainer) {
      var cards = Array.prototype.slice.call(cardContainer.querySelectorAll('.searchable-card'));
      filterInput.addEventListener('input', function () {
        var keyword = normalize(filterInput.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' '));
          var visible = !keyword || haystack.indexOf(keyword) >= 0;
          card.style.display = visible ? '' : 'none';
          if (visible) {
            visibleCount += 1;
          }
        });

        if (emptyState) {
          emptyState.classList.toggle('visible', visibleCount === 0);
        }
      });
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchStatus = document.querySelector('[data-search-status]');
    var searchInput = document.querySelector('[data-search-input]');

    if (searchResults && window.SITE_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (searchInput) {
        searchInput.value = query;
      }

      function renderSearch(value) {
        var keyword = normalize(value);
        if (!keyword) {
          searchResults.innerHTML = '';
          if (searchStatus) {
            searchStatus.textContent = '输入关键词开始搜索。';
          }
          return;
        }

        var matches = window.SITE_MOVIES.filter(function (movie) {
          var haystack = normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.category,
            (movie.tags || []).join(' ')
          ].join(' '));
          return haystack.indexOf(keyword) >= 0;
        }).slice(0, 120);

        searchResults.innerHTML = matches.map(cardMarkup).join('');
        if (searchStatus) {
          searchStatus.textContent = matches.length ? '已找到相关影片。' : '没有找到匹配的影片。';
        }
      }

      renderSearch(query);

      if (searchInput) {
        searchInput.addEventListener('input', function () {
          renderSearch(searchInput.value);
        });
      }
    }
  });
})();
