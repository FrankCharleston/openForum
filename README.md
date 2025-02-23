# OpenForum

OpenForum is a browser extension designed to facilitate seamless encryption and decryption of messages within public forums. It allows users to encrypt their messages before posting them and decrypt messages from others, ensuring privacy and security.

## Features

- **Inline Encryption & Decryption**: Encrypt and decrypt messages directly on web pages.
- **Clipboard Integration**: Handle encrypted content via clipboard operations.
- **Context Menu Options**: Access encryption features through the browser's right-click menu.
- **User-Friendly Interface**: Simplified UI for both encryption and decryption processes.
- **Theme Support**: Light, dark, and system themes.
- **Debug Mode**: Enable debug mode for detailed logging.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/FrankCharleston/openForum.git
   cd openForum
   ```

2. Load the extension in your browser:
   - Open your browser's extensions page (e.g., `chrome://extensions/`).
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `openForum` directory.

## Usage

### Encrypting a Message

1. Open the extension popup by clicking the OpenForum icon in the browser toolbar.
2. Enter your message and passphrase.
3. Click the "Encrypt" button.
4. The encrypted message will be displayed in the input field, prefixed with `ENC[...]`.

### Decrypting a Message

1. Open the extension popup by clicking the OpenForum icon in the browser toolbar.
2. Enter the encrypted message and the passphrase used for encryption.
3. Click the "Decrypt" button.
4. The decrypted message will be displayed in the input field.

### Settings

1. Open the options page by clicking the "Options" button in the extension popup or navigating to the extension's options page.
2. Configure the following settings:
   - **Auto Decrypt**: Enable or disable automatic decryption of messages on page load.
   - **Default Passphrase**: Set a default passphrase for encryption and decryption.
   - **Theme**: Choose between light, dark, and system themes.
   - **Debug Mode**: Enable or disable debug mode for detailed logging.

### Error Logs

1. View error logs on the options page under the "Error Logs" section.
2. Clear error logs by clicking the "Clear Logs" button.

## Development

### File Structure

- **popup.js**: Handles the extension popup interface and its functionalities.
- **options.js**: Manages the options page and settings.
- **content_script.js**: Injects scripts into web pages to enable inline encryption/decryption.
- **background.js**: Handles background operations, including context menu actions.
- **crypto-utils.js**: Contains cryptographic functions leveraging the crypto-js library.

### Running Locally

1. Install dependencies (if any):
   ```sh
   npm install
   ```

2. Start the development server:
   ```sh
   npm start
   ```

3. Load the extension in your browser as described in the installation section.

### Contributing

1. Fork the repository.
2. Create a new branch:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```sh
   git commit -m "Add your commit message"
   ```
4. Push to the branch:
   ```sh
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to the contributors and the open-source community for their support and contributions.
- Crediting @bobsteger for identifying the issue [#14](https://github.com/FrankCharleston/openForum/issues/14).