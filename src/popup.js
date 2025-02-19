document.getElementById("encryptBtn").addEventListener("click", () => {
    const text = document.getElementById("inputText").value;
    if (!text) return;

    let passphrase = prompt("Enter encryption passphrase:", "mypassword");
    if (!passphrase) return;

    const encryptedText = CryptoJS.AES.encrypt(text, passphrase).toString();
    document.getElementById("inputText").value = `ENC[${encryptedText}]`;
    logMessage("[INFO] ✅ Encrypted message successfully.");
});

document.getElementById("decryptBtn").addEventListener("click", () => {
    const text = document.getElementById("inputText").value.replace(/ENC\[|\]/g, "");
    if (!text) return;

    let passphrase = prompt("Enter decryption passphrase:", "mypassword");
    if (!passphrase) return;

    const decrypted = CryptoJS.AES.decrypt(text, passphrase).toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
        logMessage("[ERROR] ❌ Decryption failed. Check your passphrase.", "error");
    } else {
        document.getElementById("inputText").value = decrypted;
        logMessage("[INFO] ✅ Decryption successful.");
    }
});

document.getElementById("decryptPage").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return;
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                let passphrase = prompt("Enter decryption passphrase (or cancel to use default):", "mypassword");
                document.querySelectorAll("*").forEach(el => {
                    const match = el.innerText.match(/ENC\[(.*?)\]/);
                    if (match) {
                        const decrypted = CryptoJS.AES.decrypt(match[1], passphrase).toString(CryptoJS.enc.Utf8);
                        if (decrypted) {
                            el.innerText = decrypted;
                        }
                    }
                });
            }
        });
    });
});

function logMessage(msg, type = "log") {
    const logContainer = document.getElementById("logContainer");
    logContainer.innerHTML += `<div class="${type}">${msg}</div>`;
}
