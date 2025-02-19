chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleDecryption") {
        scanAndDecrypt();
        sendResponse({ status: "Decryption triggered" });
    } else if (message.action === "decryptText") {
        const decryptedText = tryDecrypt(message.text, prompt("Enter decryption passphrase:", "mypassword"));
        sendResponse({ success: !!decryptedText, decryptedText });
    }
});

function scanAndDecrypt() {
    document.querySelectorAll("*").forEach(element => {
        const encryptedText = extractEncryptedText(element.innerText);
        if (encryptedText) {
            decryptMessage(encryptedText, (decrypted) => {
                if (decrypted) {
                    element.innerHTML = element.innerHTML.replace(
                        `ENC[${encryptedText}]`,
                        `<span class='decrypted-message' style='color: green;'>${decrypted}</span>`
                    );
                }
            });
        }
    });
}
