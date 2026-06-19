(function () {
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applySearch(term) {
    var query = normalize(term);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-line'));
    var empty = document.querySelector('.empty-state');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  document.querySelectorAll('input[type="search"]').forEach(function (input) {
    if (initialQuery) {
      input.value = initialQuery;
    }
  });

  if (initialQuery) {
    applySearch(initialQuery);
  }

  document.querySelectorAll('.js-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[type="search"]');
      var value = input ? input.value.trim() : '';
      if (value) {
        event.preventDefault();
        window.location.href = './library.html?q=' + encodeURIComponent(value);
      }
    });
  });

  document.querySelectorAll('.js-inline-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[type="search"]');
      applySearch(input ? input.value : '');
    });
  });

  document.querySelectorAll('.quick-filters button').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('.quick-filters button').forEach(function (other) {
        other.classList.remove('active');
      });
      button.classList.add('active');
      applySearch(button.getAttribute('data-filter') || '');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  var next = document.querySelector('.hero-next');
  var prev = document.querySelector('.hero-prev');

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide') || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader="true"]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachSource(video, src, done) {
    if (!src) {
      done();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = 'true';
      done();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
        video.dataset.ready = 'true';
      } else {
        video.src = src;
        video.dataset.ready = 'true';
      }
      done();
    });
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var play = function () {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    };

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (video.dataset.ready === 'true') {
      play();
    } else {
      attachSource(video, source, play);
    }
  }

  document.querySelectorAll('.js-player').forEach(function (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      startPlayer(shell);
    });

    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');

    if (video && overlay) {
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  });
})();
