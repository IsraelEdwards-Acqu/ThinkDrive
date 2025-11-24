window.quizEffects = {
    showSplash: function () {
        const container = document.querySelector('.quiz-container');
        if (!container) return;

        // Play level-up sound
        const audio = new Audio('/sounds/level-up-47165.mp3'); // ✅ place your sound file in wwwroot/sounds
        audio.volume = 0.6; // not too loud
        audio.play().catch(err => console.log("Audio play failed:", err));

        // Create 8 splash elements for a burst
        const count = 8;
        for (let i = 0; i < count; i++) {
            const splash = document.createElement('div');
            splash.className = 'correct-splash';

            // Randomize position around center
            const angle = (360 / count) * i;
            const radius = 80 + Math.random() * 40;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;

            splash.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.5) rotate(${Math.random() * 360}deg)`;

            container.appendChild(splash);

            // Animate outward
            setTimeout(() => {
                splash.style.transition = "transform 0.9s ease, opacity 0.9s ease";
                splash.style.transform = `translate(calc(-50% + ${x * 1.5}px), calc(-50% + ${y * 1.5}px)) scale(1.2)`;
                splash.style.opacity = "0";
            }, 50);

            // Remove after animation
            setTimeout(() => splash.remove(), 1200);
        }
    }
};