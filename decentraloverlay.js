document.addEventListener("scroll", function (event) {
    console.log("[INFO] Scrolling detected");
}, { passive: true });

document.addEventListener("touchstart", function (event) {
    console.log("[INFO] Touch detected");
}, { passive: true });

document.addEventListener("wheel", function (event) {
    console.log("[INFO] Mouse wheel used");
}, { passive: true });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleDecryption") {
        scanAndDecrypt();
        sendResponse({ status: "Decryption triggered" });
    } else if (message.action === "decryptText") {
        const decryptedText = decryptText(message.text, prompt("Enter decryption passphrase:", "mypassword"));
        sendResponse({ success: !!decryptedText, decryptedText });
    }
});

async function loadCryptoUtils() {
    if (typeof encryptText === "undefined") {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("crypto-utils.js");
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadCryptoUtils().then(() => {
        console.log("[INFO] CryptoJS loaded.");
    });
});

async function scanAndDecrypt() {
    await loadCryptoUtils();  // ✅ Ensures functions are available

    document.querySelectorAll("*").forEach(element => {
        const encryptedText = extractEncryptedText(element.innerText);
        if (encryptedText) {
            let decryptedText = decryptText(encryptedText, prompt("Enter passphrase:", "mypassword"));
            if (decryptedText) {
                element.innerHTML = element.innerHTML.replace(
                    `ENC[${encryptedText}]`,
                    `<span class='decrypted-message' style='color: green;'>${decryptedText}</span>`
                );
            }
        }
    });
}

