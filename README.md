# **🔐 OpenForum - Secure & Seamless Message Encryption**
**Version:** `1.1.0`  
**Author:** [FrankCharleston](https://github.com/FrankCharleston/openForum)

---

## **📌 Overview**
OpenForum is a browser extension that allows users to **encrypt and decrypt text** seamlessly within web pages. It provides:
- **Inline Encryption & Decryption** via the popup UI  
- **Right-Click Context Menu Actions** for quick access  
- **Persistent Activity Logs** for better visibility  
- **Auto-decryption with passphrases**  
- **Error logging & troubleshooting tools**

---

## **🚀 Features**
### **🔹 Inline Encryption & Decryption**
- Enter a message in the popup and **encrypt** it using a passphrase.  
- Copy & paste encrypted messages and **decrypt** them back to plaintext.  

### **🔹 Context Menu Actions (Right-Click)**
- **Encrypt Selected Text** → Right-click selected text to encrypt it.  
- **Decrypt Selected Text** → Right-click encrypted text to decrypt it.

### **🔹 Persistent Logging & Status Messages**
- Logs encryption/decryption actions inside the popup UI.
- **Color-coded logs** for success, warnings, and errors.

### **🔹 Options & Error Pages**
- **⚙ Open Settings** → Configure auto-decryption preferences.  
- **🚨 View Errors** → Open a troubleshooting page for decryption failures.

---

## **📁 File Structure**


## **📜 Installation Guide**
### **🔹 Load as an Unpacked Extension**
1. Open **Google Chrome** (or Edge).  
2. Go to `chrome://extensions/`  
3. Enable **Developer Mode** (top-right corner).  
4. Click **"Load Unpacked"** and select the `OpenForum` folder.  
5. The extension will now appear in the toolbar.  

---

## **🛠 Usage**
### **🔹 Encrypt Text**
1. Click the OpenForum extension icon.  
2. Enter your **message** & **passphrase**.  
3. Click **"Encrypt"** and copy the result.

### **🔹 Decrypt Text**
1. Paste **an encrypted message** into the text box.  
2. Enter the correct **passphrase**.  
3. Click **"Decrypt"** to reveal the original message.

### **🔹 Using Right-Click Encryption**
1. Highlight **any text** on a webpage.  
2. Right-click and select **"Encrypt Selected Text"**.  
3. The encrypted text is **copied to your clipboard**.

### **🔹 Accessing Settings & Errors**
- **Settings**: Click the **"⚙ Open Settings"** button in the popup.  
- **Errors**: Click **"🚨 View Errors"** to see decryption issues.  

---

## **📖 Technical Details**
### **🔹 Encryption Algorithm**
- Uses **AES encryption** via **CryptoJS** (`lib/crypto-js.min.js`).  
- Encrypted messages follow the format: ENC[<encrypted_data>]

### **🔹 Manifest Permissions**
- **Context Menus** → Adds right-click actions.  
- **Storage** → Saves settings & error logs.  
- **Scripting** → Injects decryption scripts into webpages.  

### **🔹 Auto-Decryption**
- The extension can attempt to **decrypt content automatically** using a saved passphrase or the dynamic user ID of the comment author (Reddit only).
- **Toggle Auto-Decryption** via **Options Page**.

---
💡 Future Improvements
🎨 Better UI/UX for the popup window.
🌐 Support for cross-browser compatibility.
🔑 Secure key storage for passphrases.
📄 License
MIT License - Free to modify, distribute, and use.