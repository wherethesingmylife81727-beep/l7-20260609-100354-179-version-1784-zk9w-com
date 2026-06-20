(function () {
    var shell = document.querySelector('[data-player]');
    var configNode = document.getElementById('video-config');

    if (!shell || !configNode) {
        return;
    }

    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play]');
    var config = JSON.parse(configNode.textContent || '{}');
    var streamUrl = config.stream;
    var mounted = false;
    var hls = null;

    function mount() {
        if (mounted || !video || !streamUrl) {
            return;
        }

        mounted = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (shell.classList.contains('is-playing') && video.paused) {
                    video.play().catch(function () {});
                }
            });
        } else {
            video.src = streamUrl;
        }
    }

    function play() {
        mount();
        shell.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        video.play().catch(function () {
            shell.classList.remove('is-playing');
        });
    }

    if (trigger) {
        trigger.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
