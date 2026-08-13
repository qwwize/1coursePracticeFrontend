import { copyText, normalizeUrl } from './link-utils.js';

const DEMO_SHORT_URL = 'https://site.ru/AbCd12';
const form = document.querySelector('.create-form');
const urlInput = document.querySelector('#url');
const errorMessage = document.querySelector('#url-error');
const result = document.querySelector('.result');
const copyButton = document.querySelector('.copy-button');
const downloadButton = document.querySelector('.download-button');
const qrContainer = document.querySelector('.qr-code');
let qrCode;
let downloadQrCode;

function showUrlError(message) {
  errorMessage.textContent = message;
  urlInput.setAttribute('aria-invalid', String(Boolean(message)));
}

form.addEventListener('submit', async (event) => {
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
  showUrlError('');
  result.classList.add('is-visible');

  if (!qrCode) {
    const qrModule = await import('./qr-code.js');
    qrCode = qrModule.createQrCode(qrContainer, DEMO_SHORT_URL, { size: 116, dotsType: 'square' });
    downloadQrCode = qrModule.downloadQrCode;
  }
});

urlInput.addEventListener('input', () => showUrlError(''));

copyButton.addEventListener('click', async () => {
  await copyText(DEMO_SHORT_URL);
  copyButton.querySelector('span').textContent = 'Скопировано';
});

downloadButton.addEventListener('click', () => {
  if (qrCode && downloadQrCode) {
    downloadQrCode(qrCode, 'short-link');
  }
});
