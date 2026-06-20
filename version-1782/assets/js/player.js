
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHlsLibrary() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }

            var existing = document.querySelector('script[data-hls-loader]');
            if (existing) {
                existing.addEventListener('load', function () {
                    resolve(window.Hls);
                });
                existing.addEventListener('error', reject);
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
            script.async = true;
            script.setAttribute('data-hls-loader', 'true');
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function initializePlayer(player) {
        var video = player.querySelector('.player-video');
        var source = player.getAttribute('data-source');
        var loading = player.querySelector('.player-loading');
        var errorBox = player.querySelector('.player-error');
        var playButtons = Array.prototype.slice.call(player.querySelectorAll('.play-toggle'));
        var muteButton = player.querySelector('.mute-toggle');
        var fullscreenButton = player.querySelector('.fullscreen-toggle');
        var hlsInstance = null;

        if (!video || !source) {
            return;
        }

        function setReady() {
            player.classList.add('is-ready');
            if (loading) {
                loading.hidden = true;
            }
        }

        function showError() {
            setReady();
            if (errorBox) {
                errorBox.hidden = false;
            }
        }

        function syncPlayState() {
            var isPlaying = !video.paused && !video.ended;
            player.classList.toggle('is-playing', isPlaying);
            playButtons.forEach(function (button) {
                if (button.classList.contains('control-button')) {
                    button.textContent = isPlaying ? '❚❚' : '▶';
                }
            });
        }

        function playOrPause() {
            if (video.paused || video.ended) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            } else {
                video.pause();
            }
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', setReady, { once: true });
        } else {
            loadHlsLibrary().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, setReady);
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError();
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                        }
                    });
                } else {
                    showError();
                }
            }).catch(showError);
        }

        video.addEventListener('click', playOrPause);
        video.addEventListener('play', syncPlayState);
        video.addEventListener('pause', syncPlayState);
        video.addEventListener('ended', syncPlayState);
        video.addEventListener('canplay', setReady, { once: true });

        playButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                playOrPause();
            });
        });

        if (muteButton) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '🔇' : '🔊';
            });
        }

        if (fullscreenButton) {
            fullscreenButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (player.requestFullscreen) {
                    player.requestFullscreen();
                }
            });
        }
    }

    ready(function () {
        document.querySelectorAll('.video-player').forEach(initializePlayer);
    });
})();
