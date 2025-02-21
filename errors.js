document.addEventListener("DOMContentLoaded", function () {
    const errorList = document.getElementById("errorList");
    const clearErrorsButton = document.getElementById("clearErrors");

    // Load stored errors
    chrome.storage.local.get("decryptionErrors", (data) => {
        let errors = data.decryptionErrors || [];
        if (errors.length === 0) {
            errorList.innerHTML = "<li>No decryption errors logged.</li>";
        } else {
            errors.forEach(err => {
                let li = document.createElement("li");
                li.textContent = `${err.timestamp}: ${err.error}`;
                errorList.appendChild(li);
            });
        }
    });

    // Clear errors
    clearErrorsButton.addEventListener("click", () => {
        chrome.storage.local.set({ decryptionErrors: [] }, () => {
            errorList.innerHTML = "<li>No decryption errors logged.</li>";
        });
    });
});
