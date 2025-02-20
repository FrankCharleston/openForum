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

import { encryptText, decryptText } from "./crypto-utils.js";

function scanAndDecrypt() {
    document.querySelectorAll("*").forEach(element => {
        const encryptedText = extractEncryptedText(element.innerText);
        if (encryptedText) {
            let decryptedText = decryptText(encryptedText, passphrase);
                if (decryptedText) {
                    element.innerHTML = element.innerHTML.replace(
                        `ENC[${encryptedText}]`,
                        `<span class='decrypted-message' style='color: green;'>${decryptedText}</span>`
                    );
                }
        }
    });
}
