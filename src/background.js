document.addEventListener("DOMContentLoaded", function () {
    console.log("[INFO] OpenForum popup loaded.");

    let messageInput = document.getElementById("messageInput");
    let passphraseInput = document.getElementById("passphraseInput");
    let outputField = document.getElementById("output");
    let encryptBtn = document.getElementById("encryptBtn");
    let decryptBtn = document.getElementById("decryptBtn");
    let toggleDecryptionBtn = document.getElementById("toggleDecryption");
    let logs = document.getElementById("logs");

    if (!messageInput || !passphraseInput || !outputField || !encryptBtn || !decryptBtn || !toggleDecryptionBtn || !logs) {
        console.error("[ERROR] One or more required elements are missing in popup.html.");
        return;
    }

    // Add event listeners safely
    encryptBtn.addEventListener("click", function () {
        let message = messageInput.value;
        let passphrase = passphraseInput.value || "default";

        if (!message.trim()) {
            showError("Enter a message to encrypt.");
            return;
        }

        try {
            let encrypted = CryptoJS.AES.encrypt(message, passphrase).toString();
            outputField.value = `ENC[${encrypted}]`;
            showSuccess("Message encrypted successfully!");
        } catch (error) {
            showError("Encryption failed.");
            console.error("[ERROR] Encryption error:", error);
        }
    });

    decryptBtn.addEventListener("click", function () {
        let encryptedMessage = messageInput.value;
        let passphrase = passphraseInput.value;

        if (!encryptedMessage.startsWith("ENC[")) {
            showError("Invalid encrypted message format.");
            return;
        }

        try {
            let encryptedData = encryptedMessage.replace("ENC[", "").replace("]", "");
            let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) throw new Error("Decryption failed.");

            outputField.value = decryptedText;
            showSuccess("Message decrypted successfully!");
        } catch (error) {
            showError("Decryption failed. Check your passphrase.");
            console.error("[ERROR] Decryption error:", error);
        }
    });

    function showError(message) {
        logs.innerHTML = `<span style="color:red;">[ERROR] ❌ ${message}</span>`;
    }

    function showSuccess(message) {
        logs.innerHTML = `<span style="color:green;">[SUCCESS] ✅ ${message}</span>`;
    }
});


// Ensure the context menu is created when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    console.log("[INFO] OpenForum installed. Creating context menus...");

    // Remove existing menu items to prevent duplicates
    chrome.contextMenus.removeAll(() => {
        // Create context menu items
        chrome.contextMenus.create({
            id: "encryptText",
            title: "🔐 Encrypt Selected Text",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "decryptText",
            title: "🔓 Decrypt Selected Text",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "decryptClipboard",
            title: "📋 Decrypt Clipboard",
            contexts: ["all"]
        });

        console.log("[INFO] Context menus created successfully.");
    });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "encryptText") {
        encryptSelectedText(info.selectionText);
    } else if (info.menuItemId === "decryptText") {
        decryptSelectedText(info.selectionText);
    } else if (info.menuItemId === "decryptClipboard") {
        decryptClipboardContent();
    }
});

// Encrypt selected text
function encryptSelectedText(selectedText) {
    let passphrase = prompt("Enter encryption passphrase:");
    if (!passphrase) return;

    try {
        let encrypted = CryptoJS.AES.encrypt(selectedText, passphrase).toString();
        let encryptedMessage = `ENC[${encrypted}]`;

        navigator.clipboard.writeText(encryptedMessage).then(() => {
            console.log("[SUCCESS] Encrypted text copied to clipboard.");
            showNotification("✅ Encryption Success", "Text copied to clipboard.");
        }).catch(err => console.error("[ERROR] Failed to copy:", err));
    } catch (error) {
        console.error("[ERROR] Encryption failed:", error);
        showNotification("⚠️ Encryption Failed", "An error occurred.");
    }
}

// Decrypt selected text
function decryptSelectedText(encryptedText) {
    let passphrase = prompt("Enter decryption passphrase:");
    if (!passphrase) return;

    if (!encryptedText.startsWith("ENC[")) {
        showNotification("⚠️ Invalid Format", "Not a valid encrypted message.");
        return;
    }

    try {
        let encryptedData = encryptedText.replace("ENC[", "").replace("]", "");
        let decryptedBytes = CryptoJS.AES.decrypt(encryptedData, passphrase);
        let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) throw new Error("Decryption failed.");

        navigator.clipboard.writeText(decryptedText).then(() => {
            console.log("[SUCCESS] Decrypted text copied to clipboard.");
            showNotification("✅ Decryption Success", decryptedText);
        }).catch(err => console.error("[ERROR] Failed to copy:", err));
    } catch (error) {
        console.error("[ERROR] Decryption failed:", error);
        showNotification("⚠️ Decryption Failed", "Check your passphrase.");
    }
}

// Decrypt clipboard content
function decryptClipboardContent() {
    let passphrase = prompt("Enter decryption passphrase:");
    if (!passphrase) return;

    navigator.clipboard.readText().then(text => {
        if (!text.startsWith("ENC[")) {
            showNotification("⚠️ No Encrypted Data", "Clipboard does not contain an encrypted message.");
            return;
        }

        let encryptedText = text.replace("ENC[", "").replace("]", "");
        try {
            let decryptedBytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
            let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedText) throw new Error("Decryption failed.");

            navigator.clipboard.writeText(decryptedText).then(() => {
                console.log("[SUCCESS] Decrypted clipboard text copied.");
                showNotification("✅ Clipboard Decryption", decryptedText);
            }).catch(err => console.error("[ERROR] Failed to copy:", err));
        } catch (error) {
            console.error("[ERROR] Decryption failed:", error);
            showNotification("⚠️ Decryption Failed", "Check your passphrase.");
        }
    }).catch(err => console.error("[ERROR] Failed to read clipboard:", err));
}

// Show a notification for success/error messages
function showNotification(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon.png",
        title: title,
        message: message,
        priority: 2
    });
}
