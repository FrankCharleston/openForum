# OpenForum

OpenForum is a browser extension that enables seamless encryption and decryption of messages across public forums. It provides a decentralized way to protect and share sensitive information while maintaining accessibility for intended recipients.

## Features
- **Encrypt a Message**: Securely encrypts text using AES-256 encryption.
- **Decrypt a Message**: Allows decryption of encrypted messages using a passphrase.
- **Decrypt Page**: Scans and decrypts all encrypted messages on a page using a supplied passphrase or a default one.
- **Clipboard Integration**: Encrypt and decrypt messages directly from the clipboard.
- **Right-Click Context Menu**: Encrypt or decrypt selected text from the browser's right-click menu.
- **Logging & Error Handling**: Tracks encryption, decryption attempts, and potential issues for better debugging.

## Installation
1. Download the OpenForum extension package.
2. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/` for Edge users).
3. Enable **Developer Mode** (toggle in the top right corner).
4. Click **Load unpacked** and select the downloaded OpenForum directory.
5. The extension should now be visible in your browser toolbar.

## Usage
### Encrypt a Message
1. Open the OpenForum popup.
2. Enter the text you want to encrypt.
3. Click **Encrypt**.
4. Copy the encrypted text (formatted as `ENC[...]`) and share it.

### Decrypt a Message
1. Paste an encrypted message (`ENC[...]`) into the input field.
2. Click **Decrypt** and enter the passphrase.
3. The decrypted message will be displayed in the input field.

### Decrypt Page
1. Open the OpenForum popup.
2. Click **Decrypt Page**.
3. All encrypted messages on the current webpage will be decrypted using the passphrase provided.

### Context Menu
1. Select any text on a webpage.
2. Right-click and choose **Encrypt Message** or **Decrypt Message**.
3. If decrypting, enter the passphrase when prompted.
4. The result will be copied to the clipboard.

## File Structure
```
OpenForum/
│── manifest.json       # Extension manifest file
│── background.js       # Handles background tasks, context menu, and clipboard actions
│── popup.html          # UI structure for the extension
│── popup.js            # Handles UI interactions and encryption/decryption logic
│── styles.css          # Styles for the extension popup
│── decentraloverlay.js # Scans and decrypts messages on webpages
│── crypto-js.min.js    # Library for AES encryption
│── icons/              # Extension icons
```

## Technologies Used
- **JavaScript** (ES6+)
- **CryptoJS** (AES-256 encryption)
- **Chrome Extensions API**

## License
This project is licensed under the MIT License. See `LICENSE` for more details.

## Contributing
1. Fork the repository.
2. Create a new branch (`feature/your-feature`).
3. Commit your changes.
4. Push the branch and create a pull request.

## Known Issues
- **Failed to read clipboard**: Ensure the browser has granted clipboard permissions.
- **Decryption failed**: Verify the passphrase and message format.

## Contact
For support, open an issue or reach out via [GitHub Issues](https://github.com/your-repo/OpenForum/issues).

