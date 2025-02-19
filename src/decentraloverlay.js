// Updated structure for a browser extension that toggles encrypted messages on Reddit

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleDecryption") {
        console.log("[DEBUG] Toggling decryption...");
        redditOverlay.scanAndDecrypt();
    }
});

const redditOverlay = {
    init: function() {
        this.observeComments();
    },

    observeComments: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    this.scanAndDecrypt();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },

    scanAndDecrypt: function() {
        document.querySelectorAll('.comment').forEach(comment => {
            const encryptedText = this.extractEncryptedText(comment.innerText);
            if (encryptedText) {
                this.decryptMessage(encryptedText, (decrypted) => {
                    comment.innerHTML = `<div class='decrypted-message'>${decrypted}</div>`;
                });
            }
        });
    },

    extractEncryptedText: function(text) {
        const match = text.match(/ENC\[(.*?)\]/);
        return match ? match[1] : null;
    },

    decryptMessage: function(encryptedText, callback) {
        try {
            console.log("[DEBUG] Attempting to decrypt:", encryptedText);
            const passphrase = "your-secret-key";  // Change this to your actual encryption key!
            const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
            console.log("[DEBUG] Decrypted:", plainText || "Failed");

            callback(plainText || "🔓 Failed to decrypt");
        } catch (e) {
            console.error("[ERROR] Decryption error:", e);
            callback("⚠️ Error decrypting message");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());