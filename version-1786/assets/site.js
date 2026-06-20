(function() {
  document.addEventListener("error", function(event) {
    var target = event.target;
    if (!target || !target.matches || !target.matches("img[data-cover]")) {
      return;
    }
    var wrap = target.closest(".poster-wrap, .hero-slide, .detail-cover, .detail-backdrop, .player-cover, .rank-cover");
    if (wrap) {
      wrap.classList.add("no-img");
    }
    target.removeAttribute("src");
  }, true);

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function() {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function() {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function() {
          showSlide(current + 1);
        }, 5000);
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    restart();

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function(scope) {
      var input = scope.querySelector("[data-search-input]");
      var regionSelect = scope.querySelector("[data-region-select]");
      var yearSelect = scope.querySelector("[data-year-select]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var query = normalize(input && input.value);
        var region = regionSelect ? regionSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";

        cards.forEach(function(card) {
          var haystack = normalize(card.getAttribute("data-keywords"));
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var visible = true;

          if (query && haystack.indexOf(query) === -1) {
            visible = false;
          }

          if (region && cardRegion !== region) {
            visible = false;
          }

          if (year && cardYear !== year) {
            visible = false;
          }

          card.style.display = visible ? "" : "none";
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (regionSelect) {
        regionSelect.addEventListener("change", apply);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
    });
  });
}());
