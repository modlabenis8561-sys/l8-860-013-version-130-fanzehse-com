(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');
    var headerSearch = document.querySelector('.header-search');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
            if (headerSearch) {
                headerSearch.classList.toggle('is-open');
            }
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        var startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var pageFilter = document.querySelector('[data-page-filter]');
    var filterList = document.querySelector('[data-filter-list]');
    var emptyState = document.querySelector('[data-empty-state]');

    if (pageFilter && filterList) {
        pageFilter.addEventListener('input', function () {
            var value = pageFilter.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        });
    }

    var searchResults = document.querySelector('[data-search-results]');
    if (searchResults && window.SEARCH_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');
        var heading = document.querySelector('[data-search-heading]');
        var empty = document.querySelector('[data-search-empty]');

        if (input) {
            input.value = query;
        }

        var list = window.SEARCH_MOVIES;
        var normalized = query.toLowerCase();
        var results = normalized ? list.filter(function (movie) {
            return [movie.title, movie.category, movie.genre, movie.year, movie.region, movie.tags, movie.oneLine]
                .join(' ')
                .toLowerCase()
                .indexOf(normalized) !== -1;
        }) : list.slice(0, 80);

        if (heading) {
            heading.textContent = query ? '“' + query + '”的搜索结果' : '热门影片入口';
        }

        searchResults.innerHTML = results.slice(0, 240).map(function (movie) {
            return [
                '<article class="movie-card">',
                '<a href="' + movie.url + '" class="poster-link" aria-label="' + escapeHtml(movie.title) + '">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
                '<span class="poster-glow"></span>',
                '</a>',
                '<div class="card-body">',
                '<a href="' + movie.url + '" class="card-title">' + escapeHtml(movie.title) + '</a>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="card-meta">',
                '<a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a>',
                '<span>' + escapeHtml(movie.year) + '</span>',
                '<strong>' + escapeHtml(movie.rating) + '</strong>',
                '</div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');

        if (empty) {
            empty.classList.toggle('is-visible', results.length === 0);
        }
    }
})();

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function initializeMoviePlayer(videoId, streamUrl, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hls = null;

    if (!video) {
        return;
    }

    var loadStream = function () {
        if (started) {
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    };

    var play = function () {
        loadStream();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
