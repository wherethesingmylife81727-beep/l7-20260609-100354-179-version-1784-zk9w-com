(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }

    callback();
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  function initSearchFilters() {
    var form = document.querySelector("[data-filter-form]");
    var input = document.querySelector("[data-filter-input]");
    var category = document.querySelector("[data-filter-category]");
    var year = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-category][data-year]"));
    var resultCount = document.querySelector("[data-result-count]");
    var empty = document.querySelector("[data-empty-state]");

    if (!input || cards.length === 0) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(input.value);
      var selectedCategory = category ? category.value : "";
      var selectedYear = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var categoryMatched = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
        var yearMatched = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var matched = categoryMatched && yearMatched && keywordMatched;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = String(visible);
      }

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", applyFilters);

    if (category) {
      category.addEventListener("change", applyFilters);
    }

    if (year) {
      year.addEventListener("change", applyFilters);
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });
    }

    applyFilters();
  }

  window.initializeMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-movie-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-trigger]");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function playVideo() {
      loadStream();

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        playVideo();
      });
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  onReady(function () {
    initMobileMenu();
    initHeroSlider();
    initSearchFilters();
  });
})();
