// Listen for messages from the popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[DEBUG] Received message from popup:", message);

    if (message.action === "toggleDecryption") {
        console.log("[DEBUG] Toggling decryption process...");
        redditOverlay.scanAndDecrypt();
        sendResponse({ status: "Decryption triggered" });
    } else {
        console.warn("[WARN] Unknown message received:", message);
    }
});

// Define the redditOverlay object
const redditOverlay = {
    init: function () {
        this.observeComments();
        this.scanAndDecrypt(); // Run decryption immediately on page load
    },

    observeComments: function () {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    console.log("[DEBUG] New comments detected, running decryption...");
                    this.scanAndDecrypt();
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    },

    scanAndDecrypt: function () {
        console.log("[DEBUG] Scanning for encrypted messages...");
        document.querySelectorAll('.comment').forEach(comment => {
            console.log("[DEBUG] Checking comment:", comment.innerText);

            const encryptedText = this.extractEncryptedText(comment.innerText);
            if (encryptedText) {
                console.log("[DEBUG] Found encrypted text:", encryptedText);
                this.decryptMessage(encryptedText, (decrypted) => {
                    if (decrypted) {
                        console.log("[DEBUG] Decrypted text:", decrypted);
                        comment.innerHTML = comment.innerHTML.replace(
                            `ENC[${encryptedText}]`,
                            `<span class='decrypted-message' style='color: green;'>${decrypted}</span>`
                        );
                    } else {
                        console.warn("[WARN] Decryption failed for:", encryptedText);
                    }
                });
            }
        });
    },

    extractEncryptedText: function (text) {
        const match = text.match(/ENC\[(.*?)\]/);
        return match ? match[1] : null;
    },

    decryptMessage: function (encryptedText, callback) {
        try {
            console.log("[DEBUG] Attempting to decrypt:", encryptedText);
            const passphrase = "mypassword";  // Ensure this matches what was used for encryption
            const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);

            if (plainText) {
                console.log("[DEBUG] Successfully decrypted:", plainText);
                callback(plainText);
            } else {
                console.warn("[WARN] Decryption failed. Empty output.");
                callback("🔓 Failed to decrypt");
            }
        } catch (e) {
            console.error("[ERROR] Decryption error:", e);
            callback("⚠️ Error decrypting message");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());
