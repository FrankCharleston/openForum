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

const redditOverlay = {
    init: function () {
        this.observeComments();
        this.scanAndDecrypt(); // Run decryption immediately on page load
    },

    observeComments: function () {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    console.log("[DEBUG] New elements detected, running decryption...");
                    this.scanAndDecrypt();
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    },

    scanAndDecrypt: function () {
        console.log("[DEBUG] Scanning for encrypted messages...");
        document.querySelectorAll("*").forEach(element => {
            const encryptedText = this.extractEncryptedText(element.innerText);
            if (encryptedText) {
                console.log("[DEBUG] Found encrypted text:", encryptedText);
                this.decryptMessage(encryptedText, (decrypted) => {
                    if (decrypted) {
                        console.log("[DEBUG] Decrypted text:", decrypted);
                        element.innerHTML = element.innerHTML.replace(
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
    
            let passphrase = prompt("Enter decryption passphrase:", "mypassword");
            if (!passphrase) {
                passphrase = "mypassword"; // Default passphrase
            }
    
            // Ensure the encrypted text is properly formatted for decryption
            if (!encryptedText || encryptedText.trim() === "") {
                console.warn("[WARN] Empty encrypted text provided.");
                callback("🔓 Failed to decrypt (empty input)");
                return;
            }
    
            let decrypted;
            try {
                decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
            } catch (error) {
                console.error("[ERROR] AES decryption failed:", error);
                callback("⚠️ Decryption error (AES failure)");
                return;
            }
    
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);
    
            if (plainText && plainText.trim() !== "") {
                console.log("[DEBUG] Successfully decrypted:", plainText);
                callback(plainText);
            } else {
                console.warn("[WARN] Decryption failed. Possible incorrect passphrase.");
                callback("🔓 Failed to decrypt (incorrect passphrase?)");
            }
        } catch (e) {
            console.error("[ERROR] Decryption error:", e);
            callback("⚠️ Error decrypting message");
        }
    }
    
};

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());
