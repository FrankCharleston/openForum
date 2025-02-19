// Initial structure for a browser extension that overlays encrypted messages on Reddit

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
        const match = text.match(/ENC\[(.*?)\]/); // Example encryption wrapper
        return match ? match[1] : null;
    },
    
    decryptMessage: function(encryptedText, callback) {
        try {
            console.log("[DEBUG] Attempting to decrypt:", encryptedText);
            
            const passphrase = "your-secret-key"; // 🔑 Change this to your actual encryption key
            const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (plainText) {
                console.log("[DEBUG] Decrypted successfully:", plainText);
            } else {
                console.log("[ERROR] Decryption failed!");
            }
    
            // Store debug logs for UI
            chrome.storage.local.set({ log: `[DEBUG] Decrypted: ${plainText || "Failed"}` });
    
            callback(plainText || "🔓 Failed to decrypt");
        } catch (e) {
            console.error("[ERROR] Decryption error:", e);
            chrome.storage.local.set({ log: `[ERROR] ${e.message}` });
            callback("⚠️ Error decrypting message");
        }
    }
    
    
};

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());
