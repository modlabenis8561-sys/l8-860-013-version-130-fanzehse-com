var MoviePlayer = (function () {
  function start(options) {
    var video = document.getElementById(options.video);
    var overlay = document.getElementById(options.overlay);
    var trigger = document.getElementById(options.trigger);
    var loaded = false;
    var hls = null;

    if (!video || !options.source) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
      } else {
        video.src = options.source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (trigger) {
      trigger.addEventListener('click', play);
    }
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

  return {
    start: start
  };
}());
