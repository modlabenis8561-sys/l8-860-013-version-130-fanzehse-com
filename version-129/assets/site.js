(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var button = document.querySelector('.mobile-menu-button');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function setupHero() {
    var stage = document.querySelector('.hero-stage');
    if (!stage) {
      return;
    }
    var slides = Array.prototype.slice.call(stage.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function setupSearch() {
    var input = document.querySelector('[data-search-input]');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var empty = document.querySelector('[data-no-result]');
    input.addEventListener('input', function () {
      var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matched = words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
        card.classList.toggle('hidden-by-search', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var layer = player.querySelector('.play-layer');
      var button = player.querySelector('.play-layer button');
      var stream = player.getAttribute('data-stream');
      var hls = null;

      function attach() {
        if (!video || !stream || video.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
      }

      function play() {
        attach();
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }
      if (layer) {
        layer.addEventListener('click', function () {
          play();
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 || video.ended) {
            player.classList.remove('is-playing');
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
