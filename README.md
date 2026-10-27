# Bitcoin Address Generator — local-first MVP

A browser-only educational address generator inspired by Royal Fork's graphical generator. Supports Bitcoin Mainnet:
- Legacy P2PKH: BIP44 path `m/44'/0'/0'/0/i`
- Nested SegWit P2SH-P2WPKH: BIP49 path `m/49'/0'/0'/0/i`
- Native SegWit P2WPKH: BIP84 path `m/84'/0'/0'/0/i`

## Security scope
- Mnemonic generation and derivation run in the browser.
- No backend, API key, analytics, address lookup, balance lookup, or transaction broadcast.
- The app does not store the mnemonic in localStorage/sessionStorage and does not display private keys.
- The build bundles dependencies locally; a deployed page still requires downloading the site's static JavaScript bundle when first opened.
- This is a learning MVP, not an audited wallet. Do not use a seed phrase from a wallet holding funds. Do not use the generated addresses for real funds until you or a qualified reviewer audit the exact source, dependencies, build, and deployment.

## Run / build
Requires Node.js 20+ on a computer or cloud development environment:
```bash
npm install
npm test
npm run build
npm run dev
```
The built website is in `dist/`. It can be deployed as a static site on GitHub Pages, Cloudflare Pages, Netlify, or another static host. No server-side environment variables are needed.

## iPhone-only deployment route (browser-based)
1. Create a public GitHub repository for this project (the site source contains no secrets).
2. Upload the project files from this ZIP to the repository root using GitHub in Safari.
3. Use a browser-based build/deploy provider such as Cloudflare Pages or Netlify and connect the repository.
4. Set build command to `npm run build`; output directory to `dist`.
5. Open the published HTTPS URL in Safari. Test first with the published BIP84 vector below.
6. If the host offers access logs, analytics, or third-party scripts, disable them. Review the built bundle and hosting configuration before using sensitive data.

GitHub Pages can also work with a GitHub Actions workflow; configure Vite base path correctly for a repository subpath if using Pages.

## Official test vector
BIP84 specifies this mnemonic (empty BIP39 passphrase), path `m/84'/0'/0'/0/0`, and first Native SegWit address:
`abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about`
`bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu`

BIP49's published vector in its canonical document is testnet (path `m/49'/1'/0'/0/0`) and address `2Mww8dCYPUpKHofjgcXcBCEGmniw9CoaiD2`. The included test validates its published child public key. The main UI is fixed to Mainnet.

## Standards and libraries
- BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
- BIP49: https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
- BIP84: https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki
- BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- @scure/bip32, @scure/bip39, @scure/btc-signer (auditable open-source dependencies)

## Known limitations
- No passphrase field, account selection, change-address selection, address batch export, QR code, or balance checking.
- Only English BIP39 wordlist.
- The address index is limited to 0–1,000,000.
- Clipboard API may require HTTPS and user interaction.
- Tests must pass in the target build environment before deployment. A passing test suite is not a security audit.
