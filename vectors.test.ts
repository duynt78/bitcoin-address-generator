import { describe, expect, it } from 'vitest';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { p2wpkh, NETWORK, TEST_NETWORK } from '@scure/btc-signer';

const BIP84_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

describe('official BIP84 mainnet test vector', () => {
  it('derives the first receiving Native SegWit address at m/84\\'/0\\'/0\\'/0/0', () => {
    const seed = mnemonicToSeedSync(BIP84_MNEMONIC, 'TREZOR');
    const child = HDKey.fromMasterSeed(seed).derive("m/84'/0'/0'/0/0");
    expect(child.publicKey).toBeTruthy();
    const payment = p2wpkh(child.publicKey!, NETWORK);
    expect(payment.address).toBe('bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu');
  });
});

describe('BIP49 official test-vector derivation primitives', () => {
  it('derives the official BIP49 testnet public key for m/49\\'/1\\'/0\\'/0/0', () => {
    // BIP49's published vector uses testnet (coin type 1) and mnemonic above.
    const seed = mnemonicToSeedSync(BIP84_MNEMONIC, 'TREZOR');
    const child = HDKey.fromMasterSeed(seed).derive("m/49'/1'/0'/0/0");
    expect(Buffer.from(child.publicKey!).toString('hex')).toBe('03a1af804ac108a8a51782198c2d034b28bf90c8803f5a53f76276fa69a4eae77f');\n    expect((await import('@scure/btc-signer')).p2sh((await import('@scure/btc-signer')).p2wpkh(child.publicKey!, TEST_NETWORK), TEST_NETWORK).address).toBe('2Mww8dCYPUpKHofjgcXcBCEGmniw9CoaiD2');
  });
});