(function () {
    var player = document.getElementById('movie-player');
    var cover = document.getElementById('player-cover');
    var stream = typeof movieStreamUrl === 'string' ? movieStreamUrl : '';
    var ready = false;
    var hls = null;

    if (!player || !stream) {
        return;
    }

    var playVideo = function () {
        var request = player.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    };

    var prepare = function (autoplay) {
        if (ready) {
            if (autoplay) {
                playVideo();
            }
            return;
        }

        ready = true;
        player.controls = true;

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = stream;
            if (autoplay) {
                player.addEventListener('loadedmetadata', playVideo, { once: true });
                playVideo();
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(player);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (autoplay) {
                    playVideo();
                }
            });
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

        player.src = stream;
        if (autoplay) {
            playVideo();
        }
    };

    var start = function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
        prepare(true);
    };

    if (cover) {
        cover.addEventListener('click', start);
    }

    player.addEventListener('click', function () {
        if (!ready) {
            start();
        }
    });
})();
