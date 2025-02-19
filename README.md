# OpenForum - Decentralized Encryption Tool

## 🚀 Features
- 🔐 Encrypt & decrypt text for forums and social media.
- 📋 Right-click to decrypt clipboard contents.
- 🖱️ Automatically scan pages for encrypted text.

## 🔧 Installation
1. Clone this repository.
2. Open **chrome://extensions/**
3. Enable **Developer mode** (top right corner).
4. Click **Load Unpacked** and select the extension folder.

## 🛠️ Usage
- Click the **OpenForum** extension icon to toggle decryption.
- Right-click and choose **Decrypt Clipboard** for copied encrypted messages.
- Encrypted messages (`ENC[...]`) will be replaced with readable text.

## 🔑 Encryption Format
```sh
echo "Your Secret Message" | openssl enc -aes-256-cbc -a -pbkdf2 -k "mypassword"
