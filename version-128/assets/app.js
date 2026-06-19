(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function initNavigation() {
        var button = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initLocalFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-local-search]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    card.classList.toggle("is-filter-hidden", query && text.indexOf(query) === -1);
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
        });

        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var homeCards = Array.prototype.slice.call(document.querySelectorAll(".movie-section [data-card]"));
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var value = button.getAttribute("data-filter-value");
                var active = button.classList.contains("is-active");
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                homeCards.forEach(function (card) {
                    card.classList.remove("is-filter-hidden");
                });
                if (!active) {
                    button.classList.add("is-active");
                    homeCards.forEach(function (card) {
                        card.classList.toggle("is-filter-hidden", card.getAttribute("data-category") !== value);
                    });
                }
            });
        });
    }

    function movieCard(item) {
        var tags = (item.tags || []).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a class=\"movie-link\" href=\"" + escapeHtml(item.url) + "\">" +
            "<span class=\"poster-wrap\"><img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><span class=\"poster-gradient\"></span><span class=\"play-badge\">▶</span><span class=\"type-badge\">" + escapeHtml(item.type) + "</span></span>" +
            "<span class=\"card-body\"><strong>" + escapeHtml(item.title) + "</strong><small>" + escapeHtml(item.desc) + "</small><span class=\"meta-line\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + "</span><span class=\"tag-line\">" + tags + "</span></span>" +
            "</a></article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initGlobalSearch() {
        var form = document.querySelector("[data-global-search-form]");
        var input = document.querySelector("[data-global-search-input]");
        var results = document.querySelector("[data-global-search-results]");
        var status = document.querySelector("[data-search-status]");
        if (!form || !input || !results || !window.SITE_SEARCH_INDEX) {
            return;
        }
        function render(query) {
            var q = normalize(query);
            var data = window.SITE_SEARCH_INDEX;
            var list = q ? data.filter(function (item) {
                return normalize([item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(" ")].join(" ")).indexOf(q) !== -1;
            }).slice(0, 80) : data.slice(0, 16);
            results.innerHTML = list.map(movieCard).join("");
            if (status) {
                status.textContent = q ? "搜索结果" : "热门影视推荐";
            }
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render(input.value);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
            render(initial);
        }
    }

    window.initMoviePlayer = function (source, poster) {
        var video = document.getElementById("movie-player");
        var layer = document.querySelector("[data-play-trigger]");
        var hls = null;
        var attached = false;
        if (!video) {
            return;
        }
        if (poster) {
            video.setAttribute("poster", poster);
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }
            video.src = source;
        }
        function start() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    ready(function () {
        initNavigation();
        initLocalFilters();
        initGlobalSearch();
    });
})();
