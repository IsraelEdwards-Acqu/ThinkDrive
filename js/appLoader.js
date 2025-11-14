window.appLoader = {
    show: function (message) {
        const loader = document.getElementById("loader");
        if (!loader) return;

        loader.style.opacity = "1";
        loader.style.display = "flex";

        const msgEl = loader.querySelector(".loader-message");
        if (msgEl) msgEl.textContent = message || "Loading ThinkDrive…";
    },

    update: function (message, percent) {
        const loader = document.getElementById("loader");
        if (!loader) return;

        const msgEl = loader.querySelector(".loader-message");
        if (msgEl) msgEl.textContent = message || "";

        const bar = loader.querySelector(".loader-bar");
        if (bar && percent !== undefined) {
            bar.style.width = percent + "%";
        }
    },

    hide: function () {
        const loader = document.getElementById("loader");
        if (!loader) return;

        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 320);
    }
};
