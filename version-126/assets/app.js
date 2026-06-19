(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    var count = document.querySelector('[data-filter-count]');
    var cards = selectAll('.movie-card[data-title]');
    if (!cards.length || (!input && !year && !type)) {
      return;
    }
    function value(node) {
      return node ? node.value.trim().toLowerCase() : '';
    }
    function apply() {
      var query = value(input);
      var yearValue = value(year);
      var typeValue = value(type);
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !yearValue || (card.getAttribute('data-year') || '').indexOf(yearValue) !== -1;
        var matchType = !typeValue || (card.getAttribute('data-type') || '').toLowerCase().indexOf(typeValue) !== -1;
        var showCard = matchQuery && matchYear && matchType;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }
    [input, year, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) {
      input.value = q;
    }
    apply();
  }

  function initPlayer() {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var button = document.querySelector('[data-player-start]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var started = false;
    var hlsInstance = null;
    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }
    function playVideo() {
      if (!source) {
        return;
      }
      hideOverlay();
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          var nativePlay = video.play();
          if (nativePlay && nativePlay.catch) {
            nativePlay.catch(function () {});
          }
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var hlsPlay = video.play();
            if (hlsPlay && hlsPlay.catch) {
              hlsPlay.catch(function () {});
            }
          });
        } else {
          video.src = source;
          var fallbackPlay = video.play();
          if (fallbackPlay && fallbackPlay.catch) {
            fallbackPlay.catch(function () {});
          }
        }
      } else {
        var replay = video.play();
        if (replay && replay.catch) {
          replay.catch(function () {});
        }
      }
    }
    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (button) {
      button.addEventListener('click', playVideo);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
