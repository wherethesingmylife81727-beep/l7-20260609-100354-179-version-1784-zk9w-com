(function () {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      const opened = mobilePanel.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    };

    const restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const filterInput = document.querySelector(".page-filter");
  const list = document.querySelector("[data-card-list]");

  if (filterInput && list) {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    if (initial) {
      filterInput.value = initial;
    }

    const cards = Array.from(list.querySelectorAll(".movie-card"));

    const filter = function () {
      const keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-text") || card.textContent || "").toLowerCase();
        card.classList.toggle("is-filter-hidden", keyword && !text.includes(keyword));
      });
    };

    filterInput.addEventListener("input", filter);
    filter();
  }

  const sortableList = document.querySelector("[data-card-list]");
  const sortButtons = Array.from(document.querySelectorAll("[data-sort]"));

  if (sortableList && sortButtons.length) {
    sortButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const mode = button.getAttribute("data-sort");
        const cards = Array.from(sortableList.querySelectorAll(".movie-card"));

        cards.sort(function (a, b) {
          if (mode === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }

          if (mode === "rating") {
            return Number(b.getAttribute("data-rating") || 0) - Number(a.getAttribute("data-rating") || 0);
          }

          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });

        cards.forEach(function (card) {
          sortableList.appendChild(card);
        });
      });
    });
  }
})();

function initSitePlayer(options) {
  const video = document.getElementById(options.videoId);
  const overlay = document.getElementById(options.overlayId);
  const button = document.getElementById(options.buttonId);
  const url = options.url;
  let started = false;
  let instance = null;

  if (!video || !overlay || !button || !url) {
    return;
  }

  const start = function () {
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");

    if (!started) {
      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(url);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = url;
    }

    video.play().catch(function () {});
  };

  overlay.addEventListener("click", start);
  button.addEventListener("click", function (event) {
    event.stopPropagation();
    start();
  });
  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  });
}
