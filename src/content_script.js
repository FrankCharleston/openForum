(() => {
    console.log("[INFO] OpenForum content script loaded.");

    // Retrieve and store decryption settings
    chrome.storage.local.get("decryptionEnabled", (data) => {
        if (data.decryptionEnabled) {
            decryptPageContent();
        }
    });

    // Function to scan and decrypt encrypted content on a webpage
    function decryptPageContent() {
        let elements = document.querySelectorAll("p, span, div");

        elements.forEach((element) => {
            let text = element.innerText;
            if (text.startsWith("ENC[")) {
                let encryptedText = text.replace("ENC[", "").replace("]", "");
                
                chrome.storage.local.get("passphrase", (data) => {
                    let passphrase = data.passphrase || "default";
                    try {
                        let decryptedBytes = CryptoJS.AES.decrypt(encryptedText, passphrase);
                        let decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

                        if (decryptedText) {
                            element.innerText = decryptedText;
                        }
                    } catch (error) {
                        console.warn("[WARN] Decryption failed for:", text);
                    }
                });
            }
        });
    }
})();
