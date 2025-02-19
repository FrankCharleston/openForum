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
                console.log("[DEBUG] Found encrypted text:", encryptedText);
                this.decryptMessage(encryptedText, (decrypted) => {
                    if (decrypted) {
                        console.log("[DEBUG] Replacing encrypted text with:", decrypted);
                        comment.innerHTML = comment.innerHTML.replace(`ENC[${encryptedText}]`, `<span class='decrypted-message' style='color: green;'>${decrypted}</span>`);
                    } else {
                        console.log("[ERROR] Decryption returned empty or failed.");
                    }
                });
            } else {
                console.log("[DEBUG] No encrypted text found in comment.");
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
            const passphrase = "mypassword"; // Ensure this matches what you used for encryption
            const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (plainText) {
                console.log("[DEBUG] Successfully decrypted:", plainText);
                callback(plainText);
            } else {
                console.log("[ERROR] Decryption failed: output is empty.");
                callback("🔓 Failed to decrypt");
            }
        } catch (e) {
            console.error("[ERROR] Decryption error:", e);
            callback("⚠️ Error decrypting message");
        }
    }        
};

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());