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
                this.decryptMessage(encryptedText, (decrypted, success) => {
                    if (success) {
                        console.log("[DEBUG] Decrypted text:", decrypted);
                        logContainer.innerHTML += `<div style='color: lightgreen;'>[SUCCESS] Decrypted: ${decrypted}</div>`;
                        element.innerHTML = element.innerHTML.replace(
                            `ENC[${encryptedText}]`,
                            `<span class='decrypted-message' style='color: green;'>${decrypted}</span>`
                        );
                    } else {
                        console.warn("[WARN] Decryption failed for:", encryptedText, " Reason:", decrypted);
                        logContainer.innerHTML += `<div style='color: red;'>[ERROR] Failed to decrypt: ${decrypted}</div>`;
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

            const rawData = CryptoJS.enc.Base64.parse(encryptedText);
            const rawBytes = rawData.words;

            if (encryptedText.startsWith("U2FsdGVk")) {  
                console.log("[DEBUG] OpenSSL format detected.");
                const salt = CryptoJS.lib.WordArray.create(rawBytes.slice(0, 2));
                const ciphertext = CryptoJS.lib.WordArray.create(rawBytes.slice(2));

                const keySize = 256 / 32;
                const ivSize = 128 / 32;
                const derivedKey = CryptoJS.PBKDF2(passphrase, salt, {
                    keySize: keySize + ivSize,
                    iterations: 10000,
                    hasher: CryptoJS.algo.SHA256
                });

                const key = CryptoJS.lib.WordArray.create(derivedKey.words.slice(0, keySize));
                const iv = CryptoJS.lib.WordArray.create(derivedKey.words.slice(keySize));

                console.log("[DEBUG] Derived Key:", key.toString());
                console.log("[DEBUG] Derived IV:", iv.toString());

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
    }
};

document.addEventListener("DOMContentLoaded", () => redditOverlay.init());
