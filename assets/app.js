(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  onReady(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var open = mobileMenu.classList.toggle("is-open");
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-global-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./videos.html";
        }
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var searchInput = scope.querySelector("[data-search-input]");
      var yearFilter = scope.querySelector("[data-year-filter]");
      var regionFilter = scope.querySelector("[data-region-filter]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var counter = scope.querySelector("[data-result-count]");
      var empty = scope.querySelector("[data-empty-state]");

      if (query && searchInput) {
        searchInput.value = query;
      }

      function applyFilters() {
        var text = normalize(searchInput ? searchInput.value : "");
        var year = yearFilter ? yearFilter.value : "";
        var region = regionFilter ? regionFilter.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search-index"));
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var matchText = !text || haystack.indexOf(text) !== -1;
          var matchYear = !year || cardYear === year;
          var matchRegion = !region || cardRegion === region;
          var show = matchText && matchYear && matchRegion;

          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = String(visible);
        }
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [searchInput, yearFilter, regionFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function showSlide(index) {
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
      }

      function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          startTimer();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          startTimer();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    }
  });
}());
