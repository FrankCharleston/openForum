(() => {
    console.log("[INFO] OpenForum content script loaded.");

    chrome.storage.local.get("decryptionEnabled", (data) => {
        if (data.decryptionEnabled) {
            decryptPageContent();
        }
    });

    function decryptPageContent() {
        let elements = document.querySelectorAll("p, span, div");

        elements.forEach((element) => {
            let text = element.innerText;
            if (text.startsWith("ENC[")) {
                let encryptedText = text.replace("ENC[", "").replace("]", "");

                chrome.storage.local.get("passphrase", (data) => {
                    let passphrase = data.passphrase || "default";

                    chrome.runtime.sendMessage(
                        { action: "decrypt", text: encryptedText, passphrase },
                        (response) => {
                            if (response && response.decrypted) {
                                element.innerText = response.decrypted;
                            }
                        }
                    );
                });
            }
        });
    }
})();
