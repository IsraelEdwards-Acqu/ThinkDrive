// wwwroot/js/confettiInterop.js
window.confettiInterop = {
    // Single burst
    burst: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) {
                console.warn("[confettiInterop] confetti library not found");
                return;
            }

            const o = options || {};
            conf({
                particleCount: o.count ?? 40,
                spread: o.spread ?? 60,
                origin: o.origin ?? { y: 0.6 },
                colors: o.colors ?? ["#bb0000", "#ffffff", "#00bb00", "#0000bb"],
                shapes: o.shapes ?? ["circle", "square"]
            });
        } catch (e) {
            console.error("[confettiInterop] burst error:", e);
        }
    },

    // Side bursts (left + right)
    sides: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) return;

            const o = options || {};
            conf({
                particleCount: o.count ?? 30,
                angle: 60,
                spread: o.spread ?? 55,
                origin: { x: 0 }
            });
            conf({
                particleCount: o.count ?? 30,
                angle: 120,
                spread: o.spread ?? 55,
                origin: { x: 1 }
            });
        } catch (e) {
            console.error("[confettiInterop] sides error:", e);
        }
    },

    // Fireworks style (multiple bursts)
    fireworks: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) return;

            const o = options || {};
            const duration = o.duration ?? 2000;
            const end = Date.now() + duration;

            (function frame() {
                conf({
                    particleCount: o.count ?? 5,
                    angle: Math.random() * 360,
                    spread: o.spread ?? 60,
                    origin: { x: Math.random(), y: Math.random() - 0.2 }
                });
                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
        } catch (e) {
            console.error("[confettiInterop] fireworks error:", e);
        }
    },

    // Continuous stream for a set duration
    stream: function (options) {
        try {
            const conf = window.confetti || window.confettiBrowser;
            if (!conf) return;

            const o = options || {};
            const duration = o.duration ?? 3000;
            const end = Date.now() + duration;

            (function frame() {
                conf({
                    particleCount: o.count ?? 2,
                    spread: o.spread ?? 70,
                    origin: o.origin ?? { y: 0.7 }
                });
                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
        } catch (e) {
            console.error("[confettiInterop] stream error:", e);
        }
    }
};
