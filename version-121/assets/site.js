(function () {
  function toggleMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .wide-card'));
    var empty = document.querySelector('[data-empty-result]');

    if (input && input.hasAttribute('data-url-query')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matchesSelect(card, select) {
      var key = select.getAttribute('data-filter-select');
      var selected = normalize(select.value);
      if (!selected) {
        return true;
      }
      var actual = normalize(card.getAttribute('data-' + key));
      return actual.indexOf(selected) !== -1;
    }

    function apply() {
      var term = normalize(input ? input.value : '');
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
        var ok = !term || text.indexOf(term) !== -1;
        selects.forEach(function (select) {
          if (!matchesSelect(card, select)) {
            ok = false;
          }
        });
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', shown === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMenu();
    setupHero();
    setupFilters();
  });
}());
