(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var opened = mobileMenu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
      toggle.textContent = opened ? '×' : '☰';
    });
  }

  var filterAreas = document.querySelectorAll('[data-filter-area]');

  filterAreas.forEach(function (area) {
    var input = area.querySelector('[data-filter-input]');
    var year = area.querySelector('[data-filter-year]');
    var type = area.querySelector('[data-filter-type]');
    var region = area.querySelector('[data-filter-region]');
    var button = area.querySelector('[data-filter-button]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('[data-title]'));
    var empty = area.querySelector('[data-empty]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function selected(select) {
      return select ? normalize(select.value) : '';
    }

    function matches(card, term, selectedYear, selectedType, selectedRegion) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var okTerm = !term || haystack.indexOf(term) !== -1;
      var okYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
      var okType = !selectedType || normalize(card.getAttribute('data-type')).indexOf(selectedType) !== -1;
      var okRegion = !selectedRegion || normalize(card.getAttribute('data-region')).indexOf(selectedRegion) !== -1;
      return okTerm && okYear && okType && okRegion;
    }

    function applyFilter() {
      var term = normalize(input ? input.value : '');
      var selectedYear = selected(year);
      var selectedType = selected(type);
      var selectedRegion = selected(region);
      var visible = 0;

      cards.forEach(function (card) {
        var show = matches(card, term, selectedYear, selectedType, selectedRegion);
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
    if (type) {
      type.addEventListener('change', applyFilter);
    }
    if (region) {
      region.addEventListener('change', applyFilter);
    }
    if (button) {
      button.addEventListener('click', applyFilter);
    }

    applyFilter();
  });

  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('moviePlayerOverlay');

  if (video && overlay && typeof currentPlaylist === 'string') {
    var attached = false;
    var hlsInstance = null;

    function attachVideo() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = currentPlaylist;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(currentPlaylist);
        hlsInstance.attachMedia(video);
      } else {
        video.src = currentPlaylist;
      }
    }

    function startVideo() {
      attachVideo();
      overlay.classList.add('hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    overlay.addEventListener('click', startVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
