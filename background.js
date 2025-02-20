chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "decryptText",
        title: "Decrypt Selected Text",
        contexts: ["selection"]
    });

    console.log("[INFO] Context menu created.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "decryptText") {
        console.log("[INFO] Decrypting selected text:", info.selectionText);

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: decryptSelectedText,
            args: [info.selectionText]
        });
    }
});

function decryptSelectedText(encryptedText) {
    let passphrase = prompt("Enter passphrase:", "mypassword");
    if (!passphrase) return;

    chrome.runtime.sendMessage(
        { action: "decrypt", text: encryptedText, passphrase },
        (response) => {
            if (response && response.decrypted) {
                alert("Decrypted Text: " + response.decrypted);
            } else {
                alert("Decryption failed.");
            }
        }
    );
}
