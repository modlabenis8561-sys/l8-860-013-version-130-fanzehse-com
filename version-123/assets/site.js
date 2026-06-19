(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    play();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "search.html";
        }
      });
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-card-list]");
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var search = panel.querySelector("[data-filter-search]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var empty = document.querySelector("[data-empty-state]");
    var regions = Array.from(new Set(cards.map(function (card) { return card.getAttribute("data-region"); }).filter(Boolean))).sort();
    var types = Array.from(new Set(cards.map(function (card) { return card.getAttribute("data-type"); }).filter(Boolean))).sort();
    var years = Array.from(new Set(cards.map(function (card) { return card.getAttribute("data-year"); }).filter(Boolean))).sort().reverse();
    fillSelect(region, regions);
    fillSelect(type, types);
    fillSelect(year, years);
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    if (search && keyword) {
      search.value = keyword;
    }
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      var y = year ? year.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.getAttribute("data-region") !== r) {
          ok = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }
    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  window.initMoviePlayer = function (src) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var wrap = document.querySelector(".player-wrap");
      var cover = document.querySelector(".player-cover");
      if (!video || !wrap || !cover || !src) {
        return;
      }
      var hls = null;
      var started = false;
      function attach() {
        if (started) {
          return;
        }
        started = true;
        wrap.classList.add("is-playing");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = src;
          video.play().catch(function () {});
        }
      }
      cover.addEventListener("click", attach);
      video.addEventListener("play", function () {
        wrap.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchForms();
    initFilters();
  });
})();
