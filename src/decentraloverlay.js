chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleDecryption") {
        scanAndDecrypt();
        sendResponse({ status: "Decryption triggered" });
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
