(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    if (header) {
        var onScroll = function () {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var setSlide = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var start = function () {
            clearInterval(timer);
            timer = setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                start();
            });
        });

        setSlide(0);
        start();
    }

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
        var scope = form.parentElement || document;
        var input = form.querySelector('[data-search-input]');
        var typeFilter = form.querySelector('[data-type-filter]');
        var yearFilter = form.querySelector('[data-year-filter]');
        var empty = scope.querySelector('[data-empty-result]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || '',
                    card.dataset.genre || '',
                    card.dataset.type || '',
                    card.dataset.region || '',
                    card.dataset.year || '',
                    card.dataset.keywords || ''
                ].join(' ').toLowerCase();
                var passKeyword = !keyword || text.indexOf(keyword) !== -1;
                var passType = !type || (card.dataset.type || '').indexOf(type) !== -1;
                var passYear = !year || (card.dataset.year || '').indexOf(year) !== -1;
                var show = passKeyword && passType && passYear;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        ['input', 'change'].forEach(function (eventName) {
            form.addEventListener(eventName, apply);
        });

        form.addEventListener('reset', function () {
            window.setTimeout(apply, 0);
        });

        apply();
    });
})();
