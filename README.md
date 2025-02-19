# OpenForum Browser Extension

## 📖 Overview
OpenForum is a **decentralized overlay** designed for **secure encryption and decryption** of messages in public forums like Reddit. It allows users to encrypt their messages before posting and decrypt them seamlessly using a browser extension.

## 🚀 Features
- **🔒 Encrypt & Decrypt:** Secure AES-256 encryption for messages.
- **🖱️ Right-Click Decryption:** Decrypt selected text directly via the context menu.
- **📋 Clipboard Decryption:** Decrypt encrypted messages from your clipboard.
- **🔍 Auto-Detect:** Automatically scans pages for encrypted messages and decrypts them.
- **📜 Debugging & Logs:** Logs all encryption/decryption attempts for easy debugging.
- **🌐 Cross-Browser Support:** Works on Chrome and Edge with future support planned.

---

## 🛠️ Installation Guide
### **1️⃣ Clone Repository**
```bash
  git clone https://github.com/FrankCharleston/openForum.git
  cd openForum
```

### **2️⃣ Load the Extension in Chrome / Edge**
1. Open your browser and go to `chrome://extensions/` (or `edge://extensions/` in Edge)
2. **Enable Developer Mode** (toggle in the top right corner)
3. Click **"Load unpacked"**
4. Select the `openForum` directory
5. The extension is now installed! 🎉

---

## 📌 How to Use
### **🔑 Encrypting a Message**
1. Open a text editor or any input field
2. Use OpenSSL in the terminal to encrypt your message:
   ```bash
   echo "Your secret message" | openssl enc -aes-256-cbc -a -pbkdf2 -k "yourpassword"
   ```
3. Copy the encrypted output and post it as `ENC[encrypted_data]`

### **🔓 Decrypting a Message**
#### **Method 1: Right-Click Decryption**
- **Highlight** any encrypted text (`ENC[...]`), right-click, and select **"Decrypt Selected Text"**

#### **Method 2: Auto-Scan & Decrypt**
- The extension will automatically **scan the page** and decrypt messages when detected.

#### **Method 3: Clipboard Decryption**
- Copy an encrypted message to your clipboard
- Click the **OpenForum extension icon** and press **"Decrypt Clipboard"**
- The decrypted text will be shown and copied back to your clipboard

---

## 🔧 Debugging & Logs
- Click the **extension popup** to view logs
- Check **Developer Tools (`F12` → Console)** for decryption details

---

## 📜 License & Attributions
- **CryptoJS** - MIT License ([link](https://github.com/brix/crypto-js))
- **OpenForum Code** - MIT License ([FrankCharleston/openForum](https://github.com/FrankCharleston/openForum))

---

## 🏗️ Roadmap & Future Enhancements
- ✅ Improved UI & logging
- ⏳ Firefox support
- 🔑 Key management system
- 🌍 Multi-language support

🎯 **Contributions Welcome!** Feel free to submit issues or pull requests to improve OpenForum!

