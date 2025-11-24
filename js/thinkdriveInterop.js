// wwwroot/js/thinkdriveInterop.js

// =======================
// Loader
// =======================
window.appLoader = {
    show: function () {
        const loader = document.getElementById("loader");
        if (!loader) return;
        loader.style.display = "block";
        loader.style.opacity = "1";
        loader.style.zIndex = "9999"; // ensure overlay
    },
    hide: function () {
        const loader = document.getElementById("loader");
        if (!loader) return;
        loader.style.transition = "opacity 0.5s ease";
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
            loader.style.transition = "";
        }, 500);
    }
};

// =======================
// Confetti
// =======================
window.confettiInterop = {
    burst: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) return console.warn("[confettiInterop] library not found");
            const o = options || {};
            conf({
                particleCount: o.count ?? 40,
                spread: o.spread ?? 60,
                origin: o.origin ?? { y: 0.6 },
                colors: o.colors ?? ["#bb0000", "#ffffff", "#00bb00", "#0000bb"],
                shapes: o.shapes ?? ["circle", "square"]
            });
        } catch (e) { console.error("[confettiInterop] burst error:", e); }
    },
    sides: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) return;
            const o = options || {};
            conf({ particleCount: o.count ?? 30, angle: 60, spread: o.spread ?? 55, origin: { x: 0 } });
            conf({ particleCount: o.count ?? 30, angle: 120, spread: o.spread ?? 55, origin: { x: 1 } });
        } catch (e) { console.error("[confettiInterop] sides error:", e); }
    },
    fireworks: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) return;
            const o = options || {};
            const end = Date.now() + (o.duration ?? 2000);
            (function frame() {
                conf({
                    particleCount: o.count ?? 5,
                    angle: Math.random() * 360,
                    spread: o.spread ?? 60,
                    origin: { x: Math.random(), y: Math.random() - 0.2 }
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            })();
        } catch (e) { console.error("[confettiInterop] fireworks error:", e); }
    },
    stream: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) return;
            const o = options || {};
            const end = Date.now() + (o.duration ?? 3000);
            (function frame() {
                conf({
                    particleCount: o.count ?? 2,
                    spread: o.spread ?? 70,
                    origin: o.origin ?? { y: 0.7 }
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            })();
        } catch (e) { console.error("[confettiInterop] stream error:", e); }
    }
};

// =======================
// Confirm Modal
// =======================
window.confirmInterop = {
    show: function (title, message, confirmText, dotnetRef) {
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";
        overlay.tabIndex = 0; // allow keyboard focus

        const box = document.createElement("div");
        box.className = "confirm-box";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const body = document.createElement("p");
        body.textContent = message;

        const actions = document.createElement("div");
        actions.className = "confirm-actions";

        const confirmBtn = document.createElement("button");
        confirmBtn.className = "btn-danger";
        confirmBtn.textContent = confirmText || "Confirm";
        confirmBtn.onclick = function () {
            try { dotnetRef?.invokeMethodAsync("OnConfirm"); } catch { }
            document.body.removeChild(overlay);
        };

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn-secondary";
        cancelBtn.textContent = "Cancel";
        cancelBtn.onclick = function () {
            document.body.removeChild(overlay);
        };

        actions.appendChild(confirmBtn);
        actions.appendChild(cancelBtn);
        box.appendChild(heading);
        box.appendChild(body);
        box.appendChild(actions);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        overlay.focus();

        // Accessibility: keyboard shortcuts
        overlay.addEventListener("keydown", e => {
            if (e.key === "Escape") cancelBtn.click();
            if (e.key === "Enter") confirmBtn.click();
        });
    }
};

// =======================
// Map (Leaflet + Heatmap)
// =======================
window.mapInterop = {
    initSchoolsHeatMap: function (schools, options) {
        try {
            if (!schools?.length) return console.warn("[mapInterop] No schools provided");
            if (typeof L === "undefined") return console.error("[mapInterop] Leaflet not loaded");

            const map = L.map("schools-map").setView([5.55, -0.2], 7);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(map);

            const heatPoints = [];
            const markers = L.markerClusterGroup ? L.markerClusterGroup() : L.layerGroup();

            schools.forEach(s => {
                const lat = s.latitude ?? s.Latitude ?? s.lat;
                const lng = s.longitude ?? s.Longitude ?? s.lng;
                if (lat && lng) {
                    const pop = s.popularity ?? s.Popularity ?? 0;
                    const name = s.name ?? s.Name ?? "School";
                    const city = s.city ?? s.City ?? "";

                    const icon = L.icon({
                        iconUrl: "/images/school-marker.png",
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                        popupAnchor: [0, -28]
                    });
                    const marker = L.marker([lat, lng], { icon })
                        .bindPopup(`<strong>${name}</strong><br/>${city}<br/>Students: ${pop}`);
                    markers.addLayer(marker);
                    heatPoints.push([lat, lng, Math.max(0.1, pop / 50)]);
                }
            });

            map.addLayer(markers);
            if (heatPoints.length && L.heatLayer) {
                L.heatLayer(heatPoints, {
                    radius: options?.radius ?? 25,
                    blur: options?.blur ?? 15,
                    maxZoom: options?.maxZoom ?? 17
                }).addTo(map);
            }
            if (heatPoints.length > 1) {
                const bounds = markers.getBounds ? markers.getBounds() : L.latLngBounds(heatPoints.map(p => [p[0], p[1]]));
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        } catch (e) { console.error("[mapInterop] error:", e); }
    }
};

// =======================
// Shorts (TikTok-style)
// =======================
window.shortsInterop = {
    initSwipe: function () {
        const feed = document.getElementById("shortsFeed");
        if (!feed) return;
        const videos = feed.querySelectorAll("video");

        const playVisible = () => {
            let index = Math.round(feed.scrollTop / window.innerHeight);
            videos.forEach((v, i) => {
                if (i === index) {
                    const p = v.play();
                    if (p && p.catch) p.catch(() => { });
                } else {
                    v.pause();
                }
            });
        };

        playVisible();
        feed.addEventListener("scroll", playVisible, { passive: true });

        // Double-tap to like
        videos.forEach(video => {
            let lastTap = 0;
            video.addEventListener("click", () => {
                const now = Date.now();
                if (now - lastTap < 300) {
                    video.dispatchEvent(new CustomEvent("doubletap"));
                    const heart = document.createElement("div");
                    heart.className = "heart-animation";
                    heart.innerHTML = "&#10084;"; // ♥
                    heart.style.position = "absolute";
                    heart.style.top = "50%";
                    heart.style.left = "50%";
                    heart.style.transform = "translate(-50%, -50%)";
                    heart.style.fontSize = "3rem";
                    heart.style.color = "red";
                    heart.style.animation = "pop 0.8s ease forwards";
                    video.parentElement.appendChild(heart);
                    setTimeout(() => heart.remove(), 800);
                }
                lastTap = now;
            });
        });
    },
    enableComments: function () {
        const feed = document.getElementById("shortsFeed");
        if (!feed) return;
        let startX = 0;
        feed.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
        feed.addEventListener("touchend", e => {
            let endX = e.changedTouches[0].clientX;
            const panel = document.querySelector(".comment-overlay");
            if (!panel) return;
            if (startX - endX > 80) panel.classList.add("open");
            if (endX - startX > 80) panel.classList.remove("open");
        }, { passive: true });
    }
};

// Global viewport play/pause for .short-video (as backup)
document.addEventListener("scroll", () => {
    const videos = document.querySelectorAll(".short-video");
    videos.forEach(v => {
        const rect = v.getBoundingClientRect();
        const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (fullyVisible) {
            const p = v.play();
            if (p && p.catch) p.catch(() => { });
        } else {
            v.pause();
        }
    });
}, { passive: true });
// =======================
// Supabase Auth Interop (Dev Mode)
// =======================
window.supabaseAuthInterop = {
    // ✅ Dev-mode signup: check existing, then insert
    signUp: async function (email, password, username, role = "Student") {
        try {
            if (!window.supabase) {
                console.error("[supabaseAuthInterop] Supabase SDK not loaded");
                return { error: "Supabase SDK not loaded" };
            }

            // 1️⃣ Check if user already exists by email
            const { data: existing, error: selectError } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .limit(1);

            if (selectError) {
                console.error("[supabaseAuthInterop] User lookup failed:", selectError.message);
                return { error: selectError.message };
            }

            let user;
            if (existing && existing.length > 0) {
                // ✅ Existing user found → reuse
                user = existing[0];
                console.log("[supabaseAuthInterop] Existing user found, auto-login:", user.email);
            } else {
                // 2️⃣ Insert new user
                const { data: insertData, error: insertError } = await supabase
                    .from("users")
                    .insert([{ email, password, username, role }])
                    .select();

                if (insertError) {
                    console.error("[supabaseAuthInterop] User insert failed:", insertError.message);
                    return { error: insertError.message };
                }

                user = insertData?.[0];
            }

            // ✅ Return a fake dev session object
            return {
                accessToken: "dev-token-" + (crypto?.randomUUID?.() || Date.now()),
                userId: user?.id || null,
                username: user?.username || null,
                email: user?.email || null,
                role: user?.role || null,
                error: null
            };
        } catch (e) {
            console.error("[supabaseAuthInterop] SignUp error:", e);
            return { error: e.message };
        }
    },

    // ✅ Dev-mode sign in: check against users table
    signIn: async function (email, password) {
        try {
            if (!window.supabase) {
                console.error("[supabaseAuthInterop] Supabase SDK not loaded");
                return { error: "Supabase SDK not loaded" };
            }

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .eq("password", password)
                .limit(1);

            if (error) {
                console.error("[supabaseAuthInterop] SignIn failed:", error.message);
                return { error: error.message };
            }

            const user = data?.[0];
            if (!user) {
                return { error: "Invalid login credentials" };
            }

            return {
                accessToken: "dev-token-" + (crypto?.randomUUID?.() || Date.now()),
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                error: null
            };
        } catch (e) {
            console.error("[supabaseAuthInterop] SignIn error:", e);
            return { error: e.message };
        }
    },

    // ✅ Dev-mode sign out: just clear session client-side
    signOut: async function () {
        try {
            console.log("[supabaseAuthInterop] Dev signOut: clear local session");
            return { ok: true };
        } catch (e) {
            console.error("[supabaseAuthInterop] SignOut error:", e);
        }
    },

    // ✅ Get current session (from local storage or memory)
    getSession: async function () {
        try {
            console.log("[supabaseAuthInterop] Dev getSession: handled in Blazor");
            return null;
        } catch (e) {
            console.error("[supabaseAuthInterop] getSession error:", e);
            return null;
        }
    }
};
// =======================
// Storage (Supabase) - Dev Mode
// =======================
window.storageInterop = {
    uploadFileFromInput: async function (inputId, bucket = "files") {
        try {
            const input = document.getElementById(inputId);
            if (!input?.files?.length) return null;

            const file = input.files[0];
            const allowedTypes = ["image/png", "image/jpeg", "video/mp4", "video/webm"];
            if (!allowedTypes.includes(file.type)) {
                alert("Only PNG, JPG, MP4, and WEBM files are allowed.");
                return null;
            }

            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const filePath = `${Date.now()}_${safeName}`;

            if (!window.supabase) {
                console.error("[storageInterop] Supabase SDK not loaded");
                return null;
            }

            // ✅ Upload without Authorization header (public bucket)
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: true
                });

            if (error) {
                console.error("[storageInterop] Upload failed:", error.message);
                return null;
            }

            // ✅ Get public URL
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            return urlData?.publicUrl ?? null;
        } catch (e) {
            console.error("[storageInterop] upload error:", e);
            return null;
        }
    }
};
// =======================
// Supabase Auth Helpers
// =======================
window.supabaseInterop = window.supabaseInterop || {};
(function () {
    window.supabaseInterop.init = function (url, anonKey) {
        if (!window.supabase) {
            console.error("[supabaseInterop] Supabase SDK not loaded");
        }
        // If already initialized in index.html, this is a no-op.
    };

    // Email/password sign-in (use when migrating off plaintext)
    window.supabaseInterop.signInWithPassword = async function (payload) {
        try {
            if (!window.supabase) return { success: false, error: "Supabase SDK not loaded" };
            const { email, password } = payload;
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { success: false, error: error.message };
            const userId = data?.user?.id || null;
            const accessToken = data?.session?.access_token || null;
            return { success: !!userId, userId, accessToken, error: null };
        } catch (e) {
            return { success: false, error: e?.message || "Unknown error" };
        }
    };

    window.supabaseInterop.signUp = async function (payload) {
        try {
            if (!window.supabase) return { success: false, error: "Supabase SDK not loaded" };
            const { email, password } = payload;
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) return { success: false, error: error.message };
            const userId = data?.user?.id || null;
            return { success: !!userId, userId, error: null };
        } catch (e) {
            return { success: false, error: e?.message || "Unknown error" };
        }
    };
})();

// =======================
// Video Interop (Autoplay, Controls)
// =======================
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
                        if (!video.paused) video.pause();
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
            const p = video.play();
            if (p && p.catch) p.catch(err => console.warn("[videoInterop] play error:", err));
        }
    },

    // Explicit pause
    pause: function (id) {
        const video = document.getElementById(id);
        if (video && !video.paused) video.pause();
    },

    // Track progress events (optional)
    attachProgress: function (id, callback) {
        const video = document.getElementById(id);
        if (video && typeof callback === "function") {
            video.addEventListener("timeupdate", () => {
                const pct = video.duration ? (video.currentTime / video.duration) * 100 : 0;
                try { callback(pct); } catch { }
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

