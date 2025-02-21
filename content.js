console.log("[DEBUG] Content script loaded");

function scanAndDecrypt() {
    console.log("[DEBUG] Scanning page for encrypted messages...");
    document.querySelectorAll("*").forEach(element => {
        const encryptedText = extractEncryptedText(element.innerText);
        if (encryptedText) {
            console.log("[DEBUG] Found encrypted text:", encryptedText);
            let decryptedText = window.decryptText(encryptedText, prompt("Enter passphrase:", "mypassword"));
            if (decryptedText) {
                console.log("[DEBUG] Decrypted text:", decryptedText);
                element.innerHTML = element.innerHTML.replace(
                    `ENC[${encryptedText}]`,
                    `<span class='decrypted-message' style='color: green;'>${decryptedText}</span>`
                );
            } else {
                console.warn("[WARN] Decryption failed for:", encryptedText);
            }
        }
    });
}

function extractEncryptedText(text) {
    const match = text.match(/ENC\[(.*?)\]/);
    return match ? match[1] : null;
}

document.addEventListener("DOMContentLoaded", scanAndDecrypt);
