chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "decryptClipboard",
        title: "Decrypt Clipboard",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "decryptClipboard") {
        try {
            const clipboardText = await navigator.clipboard.readText();
            console.log("[DEBUG] Clipboard data:", clipboardText);

            if (!clipboardText.startsWith("ENC[")) {
                alert("No encrypted message detected in clipboard.");
                return;
            }

            const encryptedText = clipboardText.replace(/ENC\[|\]/g, "");
            decryptClipboardText(encryptedText);
        } catch (error) {
            console.error("[ERROR] Failed to read clipboard:", error);
            alert("Error accessing clipboard data.");
        }
    }
});

function decryptClipboardText(encryptedText) {
    let passphrase = prompt("Enter decryption passphrase:", "mypassword");
    if (passphrase === null) {
        console.log("[DEBUG] Decryption canceled by user.");
        return;
    }

    try {
        console.log("[DEBUG] Attempting to decrypt clipboard data...");
        
        // Decode from Base64
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
                alert("Decrypted Message: " + plainText);
                navigator.clipboard.writeText(plainText).then(() => {
                    console.log("[DEBUG] Decrypted text copied to clipboard.");
                });
            } else {
                console.warn("[WARN] Decryption failed. Possible incorrect passphrase or corrupted input.");
                alert("🔓 Failed to decrypt (incorrect passphrase or corrupted input)");
            }
        } else {
            console.warn("[WARN] Unrecognized encryption format.");
            alert("⚠️ Unrecognized encryption format. Ensure it's OpenSSL AES-256-CBC.");
        }
    } catch (e) {
        console.error("[ERROR] Decryption error:", e);
        alert("⚠️ Error decrypting message");
    }
}
