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
        let logContainer = document.getElementById("decryption-log");
        if (!logContainer) return;
        
        document.querySelectorAll("*").forEach(element => {
            const encryptedText = this.extractEncryptedText(element.innerText);
            console.log("[DEBUG] Checking element:", element, "Extracted text:", encryptedText);
            if (encryptedText) {
                console.log("[DEBUG] Found encrypted text:", encryptedText);
                logContainer.innerHTML += `<div>[INFO] Found encrypted text: ${encryptedText}</div>`;
                chrome.runtime.sendMessage({ type: "log", content: `[INFO] Found encrypted text: ${encryptedText}` });
    
                this.decryptMessage(encryptedText, (decrypted, success) => {
                    if (success) {
                        console.log("[DEBUG] Decrypted text:", decrypted);
                        logContainer.innerHTML += `<div style='color: lightgreen;'>[SUCCESS] Decrypted: ${decrypted}</div>`;
                        chrome.runtime.sendMessage({ type: "log", content: `[SUCCESS] Decrypted: ${decrypted}` });
                        element.innerHTML = element.innerHTML.replace(
                            `ENC[${encryptedText}]`,
                            `<span class='decrypted-message' style='color: green;'>${decrypted}</span>`
                        );
                    } else {
                        console.warn("[WARN] Decryption failed for:", encryptedText, " Reason:", decrypted);
                        logContainer.innerHTML += `<div style='color: red;'>[ERROR] Failed to decrypt: ${decrypted}</div>`;
                        chrome.runtime.sendMessage({ type: "log", content: `[ERROR] Failed to decrypt: ${decrypted}` });
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
            console.log("[DEBUG] Attempting to decrypt OpenSSL AES-256-CBC text:", encryptedText);
    
            let passphrase = prompt("Enter decryption passphrase (or cancel to exit):", "mypassword");
            if (passphrase === null) {
                console.log("[DEBUG] Decryption canceled by user.");
                return;
            }
            console.log("[DEBUG] Using passphrase:", passphrase);
    
            // Ensure the encrypted text is in a proper OpenSSL Base64 format
            const rawData = CryptoJS.enc.Base64.parse(encryptedText);
            const rawBytes = rawData.words;
    
            // OpenSSL salt extraction
            if (encryptedText.startsWith("U2FsdGVk")) {  // "Salted__" in Base64
                console.log("[DEBUG] OpenSSL format detected.");
                const salt = CryptoJS.lib.WordArray.create(rawBytes.slice(0, 2)); // Extract salt
                const ciphertext = CryptoJS.lib.WordArray.create(rawBytes.slice(2));
    
                // Derive key and IV using PBKDF2
                const keySize = 256 / 32; // AES-256 key size
                const ivSize = 128 / 32; // AES uses a 128-bit IV
                const derivedKey = CryptoJS.PBKDF2(passphrase, salt, {
                    keySize: keySize + ivSize, // Key + IV
                    iterations: 10000,
                    hasher: CryptoJS.algo.SHA256
                });
    
                const key = CryptoJS.lib.WordArray.create(derivedKey.words.slice(0, keySize));
                const iv = CryptoJS.lib.WordArray.create(derivedKey.words.slice(keySize));
    
                console.log("[DEBUG] Derived Key:", key.toString());
                console.log("[DEBUG] Derived IV:", iv.toString());
    
                // Perform AES decryption
                const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
                const plainText = decrypted.toString(CryptoJS.enc.Utf8);
    
                if (plainText && plainText.trim() !== "") {
                    console.log("[DEBUG] Successfully decrypted:", plainText);
                    callback(plainText, true);
                } else {
                    console.warn("[WARN] Decryption failed. Possible incorrect passphrase or corrupted input.");
                    callback("🔓 Failed to decrypt (incorrect passphrase or corrupted input)", false);
                }
            } else {
                console.warn("[WARN] Unrecognized encryption format.");
                callback("⚠️ Unrecognized encryption format. Ensure it's OpenSSL AES-256-CBC.", false);
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
            <div id="decryption-log" style="margin-top: 10px; max-height: 100px; overflow-y: auto; font-size: 12px; background: black; padding: 5px; border-radius: 5px;"></div>
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
