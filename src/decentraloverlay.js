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
        console.log("[DEBUG] Initializing overlay...");
        this.observeComments();
        this.scanAndDecrypt(); // Run decryption immediately on page load
        this.addOverlayUI();
    },

    observeComments: function () {
        console.log("[DEBUG] Setting up MutationObserver...");
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
            console.log("[DEBUG] Checking element:", element, "Extracted text:", encryptedText);
            if (encryptedText) {
                console.log("[DEBUG] Found encrypted text:", encryptedText);
                this.decryptMessage(encryptedText, (decrypted, success) => {
                    if (success) {
                        console.log("[DEBUG] Decrypted text:", decrypted);
                        element.innerHTML = element.innerHTML.replace(
                            `ENC[${encryptedText}]`,
                            `<span class='decrypted-message' style='color: green;'>${decrypted}</span>`
                        );
                    } else {
                        console.warn("[WARN] Decryption failed for:", encryptedText, " Reason:", decrypted);
                    }
                });
            }
        });
    },

    extractEncryptedText: function (text) {
        console.log("[DEBUG] Extracting encrypted text from:", text);
        const match = text.match(/ENC\[(.*?)\]/);
        return match ? match[1] : null;
    },

    decryptMessage: function (encryptedText, callback) {
        try {
            console.log("[DEBUG] Attempting to decrypt:", encryptedText);
            let passphrase = prompt("Enter decryption passphrase:", "mypassword");
            console.log("[DEBUG] Using passphrase:", passphrase);
            if (!passphrase) {
                passphrase = "mypassword"; // Default passphrase
            }
            
            const decrypted = CryptoJS.AES.decrypt(encryptedText, passphrase);
            const plainText = decrypted.toString(CryptoJS.enc.Utf8);

            if (plainText && plainText.trim() !== "") {
                console.log("[DEBUG] Successfully decrypted:", plainText);
                callback(plainText, true);
            } else {
                console.warn("[WARN] Decryption failed for input:", encryptedText, "Possible incorrect passphrase or malformed input.");
                callback("🔓 Failed to decrypt (incorrect passphrase or malformed input)", false);
            }
        } catch (e) {
            console.error("[ERROR] Decryption error on input:", encryptedText, "Exception:", e);
            callback("⚠️ Error decrypting message", false);
        }
    },

    addOverlayUI: function () {
        console.log("[DEBUG] Adding floating UI overlay...");
        const overlay = document.createElement("div");
        overlay.setAttribute("id", "decryption-overlay");
        overlay.innerHTML = `<div style="position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-family: Arial, sans-serif; z-index: 9999;">
            <button id="decrypt-all" style="padding: 5px 10px; background: green; color: white; border: none; cursor: pointer;">Decrypt All</button>
            <button id="clear-logs" style="padding: 5px 10px; background: red; color: white; border: none; cursor: pointer;">Clear Logs</button>
            <button id="close-overlay" style="padding: 5px 10px; background: gray; color: white; border: none; cursor: pointer;">Close</button>
            <div id="decryption-log" style="margin-top: 10px; max-height: 100px; overflow-y: auto; font-size: 12px;"></div>
        </div>`;
        document.body.appendChild(overlay);

        document.getElementById("decrypt-all").addEventListener("click", () => {
            console.log("[DEBUG] Decrypt All button clicked");
            this.scanAndDecrypt();
        });

        document.getElementById("clear-logs").addEventListener("click", () => {
            console.clear();
            console.log("[DEBUG] Logs cleared");
            document.getElementById("decryption-log").innerHTML = "";
        });

        document.getElementById("close-overlay").addEventListener("click", () => {
            console.log("[DEBUG] Closing overlay");
            document.getElementById("decryption-overlay").remove();
        });
    }
};

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());