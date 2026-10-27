import { Buffer } from 'buffer';
import { HDKey } from '@scure/bip32';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { NETWORK, p2pkh, p2sh, p2wpkh } from '@scure/btc-signer';
import './style.css';

// This app derives public addresses locally. It deliberately does not display
// or export private keys, and does not send seed phrases to a server.
const root = document.querySelector<HTMLDivElement>('#root')!;
const MAINNET = NETWORK;

type Kind = 'legacy' | 'nested' | 'native';
type ResultRow = { kind: Kind; path: string; address: string; publicKey: string };

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]!));
}

function deriveAddress(seedPhrase: string, kind: Kind, index: number): ResultRow {
  if (!Number.isInteger(index) || index < 0 || index > 1000000) {
    throw new Error('Chỉ số địa chỉ phải là số nguyên từ 0 đến 1.000.000.');
  }
  const purpose = kind === 'legacy' ? 44 : kind === 'nested' ? 49 : 84;
  const path = `m/${purpose}'/0'/0'/0/${index}`;
  const seed = mnemonicToSeedSync(seedPhrase.trim());
  const master = HDKey.fromMasterSeed(seed);
  const child = master.derive(path);
  if (!child.publicKey) throw new Error('Không thể tạo khóa công khai từ cụm từ này.');
  const pubkey = child.publicKey;
  let address: { address: string };
  if (kind === 'legacy') {
    address = p2pkh(pubkey, MAINNET);
  } else if (kind === 'nested') {
    address = p2sh(p2wpkh(pubkey, MAINNET), MAINNET);
  } else {
    address = p2wpkh(pubkey, MAINNET);
  }
  return {
    kind,
    path,
    address: address.address,
    publicKey: Buffer.from(pubkey).toString('hex')
  };
}

function label(kind: Kind): string {
  return kind === 'legacy' ? 'Legacy · P2PKH' :
    kind === 'nested' ? 'Nested SegWit · BIP49' : 'Native SegWit · BIP84';
}

function renderRows(rows: ResultRow[]): string {
  return rows.map(row => `
    <article class="result">
      <div class="result-head"><strong>${label(row.kind)}</strong><span class="pill">${row.kind === 'legacy' ? '1…' : row.kind === 'nested' ? '3…' : 'bc1q…'}</span></div>
      <label>Địa chỉ nhận Bitcoin</label>
      <div class="address-line"><code>${escapeHtml(row.address)}</code><button class="copy" data-copy="${escapeHtml(row.address)}">Sao chép</button></div>
      <details><summary>Chi tiết kỹ thuật</summary>
        <p><small>Đường dẫn dẫn xuất</small><code>${escapeHtml(row.path)}</code></p>
        <p><small>Khóa công khai (không bí mật)</small><code class="pubkey">${escapeHtml(row.publicKey)}</code></p>
      </details>
    </article>
  `).join('');
}

root.innerHTML = `
  <main class="shell">
    <header>
      <div class="brand-mark">₿</div>
      <div><p class="eyebrow">LOCAL-ONLY · OPEN SOURCE</p><h1>Bitcoin Address Generator</h1><p class="subtitle">Tạo địa chỉ Legacy, Nested SegWit và Native SegWit ngay trong trình duyệt.</p></div>
    </header>
    <section class="warning" role="note">
      <strong>Không dùng với tiền thật khi chưa tự kiểm toán mã nguồn.</strong>
      <p>Đây là bản MVP tham khảo. Không nhập cụm từ khôi phục của ví đang có tiền. Hãy thử bằng cụm từ mẫu trước. Ứng dụng không gửi cụm từ lên máy chủ và không lưu vào bộ nhớ trình duyệt; tuy vậy, thiết bị hoặc trình duyệt bị xâm nhập vẫn có thể làm lộ dữ liệu.</p>
    </section>
    <section class="panel">
      <div class="section-title"><span class="step">01</span><div><h2>Cụm từ khôi phục</h2><p>Tạo cụm từ mới hoặc nhập cụm từ thử nghiệm của bạn.</p></div></div>
      <div class="actions"><button id="new-phrase" class="secondary">Tạo cụm từ thử nghiệm mới</button><button id="toggle-phrase" class="secondary">Ẩn cụm từ</button></div>
      <textarea id="mnemonic" rows="3" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="12 hoặc 24 từ tiếng Anh, cách nhau bằng dấu cách"></textarea>
      <p class="hint">Ứng dụng không lưu cụm từ. Không chụp màn hình hoặc chia sẻ cụm từ khôi phục.</p>
      <div class="section-title top-gap"><span class="step">02</span><div><h2>Chọn địa chỉ</h2><p>Mạng được cố định ở Bitcoin Mainnet.</p></div></div>
      <div class="choices">
        <label class="choice"><input type="checkbox" id="legacy" checked><span><b>Legacy</b><small>P2PKH · bắt đầu bằng 1</small></span></label>
        <label class="choice"><input type="checkbox" id="nested" checked><span><b>Nested SegWit</b><small>BIP49 · bắt đầu bằng 3</small></span></label>
        <label class="choice"><input type="checkbox" id="native" checked><span><b>Native SegWit</b><small>BIP84 · bắt đầu bằng bc1q</small></span></label>
      </div>
      <label class="field-label" for="index">Chỉ số địa chỉ (index)</label>
      <input id="index" type="number" min="0" max="1000000" step="1" value="0" inputmode="numeric">
      <button id="derive" class="primary">Tạo địa chỉ</button>
      <p id="status" class="status" aria-live="polite"></p>
    </section>
    <section id="results" class="results" aria-live="polite"></section>
    <footer>
      <p><strong>Chuẩn kỹ thuật:</strong> BIP44 (Legacy), BIP49 (Nested SegWit), BIP84 (Native SegWit), BIP39 và BIP32.</p>
      <p>Không có API key, backend, analytics hoặc dịch vụ blockchain. Không kiểm tra số dư và không phát giao dịch.</p>
      <p class="links"><a href="https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki" target="_blank" rel="noreferrer">BIP44</a> · <a href="https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki" target="_blank" rel="noreferrer">BIP49</a> · <a href="https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki" target="_blank" rel="noreferrer">BIP84</a></p>
    </footer>
  </main>
`;

const phraseInput = document.querySelector<HTMLTextAreaElement>('#mnemonic')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const results = document.querySelector<HTMLElement>('#results')!;
const phraseToggle = document.querySelector<HTMLButtonElement>('#toggle-phrase')!;

function setStatus(message: string, isError = false) {
  status.textContent = message;
  status.className = isError ? 'status error' : 'status';
}

document.querySelector<HTMLButtonElement>('#new-phrase')!.addEventListener('click', () => {
  phraseInput.value = generateMnemonic(wordlist, 128);
  phraseInput.focus();
  setStatus('Đã tạo cụm từ mới trong bộ nhớ của trang. Hãy dùng cụm từ mẫu để thử nghiệm; đừng dùng cho tiền thật.');
  results.innerHTML = '';
});

phraseToggle.addEventListener('click', () => {
  const hidden = phraseInput.dataset.hidden === 'true';
  phraseInput.dataset.hidden = String(!hidden);
  (phraseInput.style as CSSStyleDeclaration & { webkitTextSecurity: string }).webkitTextSecurity = hidden ? 'none' : 'disc';
  phraseToggle.textContent = hidden ? 'Ẩn cụm từ' : 'Hiện cụm từ';
});

document.querySelector<HTMLButtonElement>('#derive')!.addEventListener('click', () => {
  try {
    const phrase = phraseInput.value.trim().replace(/\s+/g, ' ');
    if (!validateMnemonic(phrase, wordlist)) {
      throw new Error('Cụm từ không hợp lệ. Dùng nút tạo cụm từ thử nghiệm hoặc kiểm tra chính tả và thứ tự từ.');
    }
    const index = Number((document.querySelector<HTMLInputElement>('#index')!).value);
    const selected: Kind[] = ([
      ['legacy', 'legacy'], ['nested', 'nested'], ['native', 'native']
    ] as const).filter(([id]) => document.querySelector<HTMLInputElement>(`#${id}`)!.checked).map(([, kind]) => kind);
    if (!selected.length) throw new Error('Hãy chọn ít nhất một loại địa chỉ.');
    const rows = selected.map(kind => deriveAddress(phrase, kind, index));
    results.innerHTML = renderRows(rows);
    setStatus(`Đã tạo ${rows.length} địa chỉ. Tất cả phép dẫn xuất được thực hiện trong trình duyệt.`);
  } catch (error) {
    results.innerHTML = '';
    setStatus(error instanceof Error ? error.message : 'Có lỗi khi tạo địa chỉ.', true);
  }
});

results.addEventListener('click', async (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-copy]');
  if (!button) return;
  try {
    await navigator.clipboard.writeText(button.dataset.copy || '');
    button.textContent = 'Đã sao chép';
    setTimeout(() => button.textContent = 'Sao chép', 1200);
  } catch {
    setStatus('Không thể dùng clipboard tự động trên trình duyệt này. Hãy chọn và sao chép địa chỉ thủ công.', true);
  }
});

// No mnemonic is pre-filled and nothing is written to localStorage/sessionStorage.
