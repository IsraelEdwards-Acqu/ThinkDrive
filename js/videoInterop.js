// wwwroot/js/videoInterop.js
window.videoInterop = {
    observer: null,

    // Initialize autoplay for videos in viewport
    initAutoplay: function (selector = ".autoplay-video") {
        try {
            if (this.observer) this.observer.disconnect();

            const options = { root: null, rootMargin: "0px", threshold: [0.5] };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    if (!video) return;

                    if (entry.intersectionRatio >= 0.5) {
                        if (video.paused) {
                            video.muted = true;
                            const p = video.play();
                            if (p && p.catch) p.catch(() => { /* ignore autoplay errors */ });
                        }
                    } else {
                        if (!video.paused) {
                            video.pause();
                        }
                    }
                });
            }, options);

            document.querySelectorAll(selector).forEach(v => {
                v.setAttribute("playsinline", "");
                v.setAttribute("webkit-playsinline", "");
                v.muted = true;
                this.observer.observe(v);
            });
        } catch (e) {
            console.error("[videoInterop] initAutoplay error:", e);
        }
    },

    // Explicit play
    play: function (id) {
        const video = document.getElementById(id);
        if (video) {
            video.muted = true;
            video.play().catch(err => console.warn("[videoInterop] play error:", err));
        }
    },

    // Explicit pause
    pause: function (id) {
        const video = document.getElementById(id);
        if (video && !video.paused) {
            video.pause();
        }
    },

    // Load video from Firebase Storage by path
    loadFromStorage: async function (id, path) {
        try {
            if (!firebase.apps.length) throw new Error("Firebase not initialized");
            const ref = firebase.storage().ref().child(path);
            const url = await ref.getDownloadURL();
            const video = document.getElementById(id);
            if (video) {
                video.src = url;
                console.log("[videoInterop] Video loaded:", path);
            }
            return url;
        } catch (err) {
            console.error("[videoInterop] loadFromStorage error:", err);
            return null;
        }
    },

    // Track progress events (optional)
    attachProgress: function (id, callback) {
        const video = document.getElementById(id);
        if (video) {
            video.addEventListener("timeupdate", () => {
                const pct = (video.currentTime / video.duration) * 100;
                callback(pct);
            });
        }
    },

    // Disconnect observer
    disconnect: function () {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
};