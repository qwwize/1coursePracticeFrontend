import { copyText, loadLinks, normalizeUrl, saveLinks } from './link-utils.js';
import { createQrCode, downloadQrCode } from './qr-code.js';

const form = document.querySelector('.create-form');
const urlInput = document.querySelector('#url');
const errorMessage = document.querySelector('#url-error');
const result = document.querySelector('.result');
const copyButton = document.querySelector('.copy-button');
const downloadButton = document.querySelector('.download-button');
const qrContainer = document.querySelector('.qr-code');
const shortUrlLink = document.querySelector('.short-link a');
let qrCode;
let currentShortUrl = shortUrlLink.href;

function showUrlError(message) {
  errorMessage.textContent = message;
  urlInput.setAttribute('aria-invalid', String(Boolean(message)));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!urlInput.value.trim()) {
    showUrlError('Введите URL');
    result.classList.remove('is-visible');
    return;
  }

  const normalizedUrl = normalizeUrl(urlInput.value);

  if (!normalizedUrl) {
    showUrlError('Введите корректный URL');
    result.classList.remove('is-visible');
    return;
  }

  urlInput.value = normalizedUrl;
  const linkId = createLinkId();
  currentShortUrl = `https://site.ru/${linkId.slice(-6)}`;
  shortUrlLink.href = currentShortUrl;
  shortUrlLink.textContent = currentShortUrl;
  saveLinks([
    {
      id: linkId,
      name: 'Ссылка',
      originalUrl: normalizedUrl,
      shortUrl: currentShortUrl,
      createdAt: new Date().toISOString(),
    },
    ...loadLinks(),
  ]);
  showUrlError('');
  result.classList.add('is-visible');

  try {
    qrCode = createQrCode(qrContainer, currentShortUrl, { size: 116, dotsType: 'square' });
  } catch {
    qrContainer.textContent = 'Не удалось загрузить QR-код';
  }
});

urlInput.addEventListener('input', () => showUrlError(''));

copyButton.addEventListener('click', async () => {
  await copyText(currentShortUrl);
  copyButton.querySelector('span').textContent = 'Скопировано';
});

downloadButton.addEventListener('click', () => {
  if (qrCode && downloadQrCode) {
    downloadQrCode(qrCode, 'short-link');
  }
});

function createLinkId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
