(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var shell = document.querySelector('[data-video-shell]');
        var video = document.querySelector('[data-hls-video]');
        var button = document.querySelector('[data-play-video]');

        if (!shell || !video) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var initialized = false;

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        function initializePlayer() {
            if (initialized || !source) {
                playVideo();
                return;
            }

            initialized = true;
            shell.classList.add('is-playing');

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                playVideo();
            } else {
                video.src = source;
                playVideo();
            }
        }

        if (button) {
            button.addEventListener('click', initializePlayer);
        }

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('click', function () {
            if (!initialized) {
                initializePlayer();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
