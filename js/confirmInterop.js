window.confirmInterop = {
    show: function (title, message, confirmText, dotnetRef) {
        const overlay = document.createElement("div");
        overlay.className = "confirm-overlay";

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
            dotnetRef.invokeMethodAsync("OnConfirm");
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
    }
};
