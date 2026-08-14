import { createQrCode } from './qr-code.js';

const PAGE_SIZE = 4;
const testLinks = [
  { id: 1, name: 'Мой сайт', shortUrl: 'https://site.ru/AbCd12', originalUrl: 'https://mysite.com', date: '24.05.2025', time: '12:45' },
  { id: 2, name: 'Презентация', shortUrl: 'https://site.ru/XyZk98', originalUrl: 'https://docs.google.com/presentation', date: '23.05.2025', time: '09:30' },
  { id: 3, name: 'Видео обзор', shortUrl: 'https://site.ru/LmNop7', originalUrl: 'https://youtube.com/watch?v=12345', date: '22.05.2025', time: '18:20' },
  { id: 4, name: 'Картинки', shortUrl: 'https://site.ru/TrH56k', originalUrl: 'https://unsplash.com/photos/example', date: '21.05.2025', time: '11:15' },
  { id: 5, name: 'Интернет магазин', shortUrl: 'https://site.ru/PlQw34', originalUrl: 'https://shop-example.com', date: '20.05.2025', time: '16:40' },
  { id: 6, name: 'Портфолио', shortUrl: 'https://site.ru/PoRt12', originalUrl: 'https://portfolio.example.com', date: '19.05.2025', time: '10:20' },
  { id: 7, name: 'Документы', shortUrl: 'https://site.ru/Docs77', originalUrl: 'https://drive.google.com/documents', date: '18.05.2025', time: '14:05' },
  { id: 8, name: 'Каталог', shortUrl: 'https://site.ru/Cat228', originalUrl: 'https://catalog.example.com/products', date: '17.05.2025', time: '08:50' },
  { id: 9, name: 'Новости', shortUrl: 'https://site.ru/News40', originalUrl: 'https://news.example.com/latest', date: '16.05.2025', time: '19:10' },
  { id: 10, name: 'Контакты', shortUrl: 'https://site.ru/Call52', originalUrl: 'https://example.com/contacts', date: '15.05.2025', time: '13:25' },
  { id: 11, name: 'Учебный проект', shortUrl: 'https://site.ru/Study9', originalUrl: 'https://university.example.com/project', date: '14.05.2025', time: '17:30' },
];

let links = [...testLinks];
let currentPage = 1;
const tableBody = document.querySelector('.table-body');
const template = document.querySelector('#link-row-template');
const pagination = document.querySelector('.pagination');
const emptyMessage = document.querySelector('.empty-message');
const qrDialog = document.querySelector('.qr-dialog');
const qrContainer = document.querySelector('.dialog-qr');

function renderLinks() {
  const pageCount = Math.max(1, Math.ceil(links.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, pageCount);
  const visibleLinks = links.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  tableBody.replaceChildren();

  visibleLinks.forEach((link) => {
    const row = template.content.firstElementChild.cloneNode(true);
    row.querySelector('.link-name').textContent = link.name;
    setLink(row.querySelector('.short-url'), link.shortUrl);
    setLink(row.querySelector('.original-url'), link.originalUrl);
    const dateParts = row.querySelectorAll('.date-cell span');
    dateParts[0].textContent = link.date;
    dateParts[1].textContent = link.time;
    row.querySelector('.qr-button').addEventListener('click', () => showQr(link));
    row.querySelector('.delete-button').addEventListener('click', () => deleteLink(link.id));
    tableBody.append(row);
  });

  emptyMessage.hidden = links.length !== 0;
  renderPagination(pageCount);
}

function setLink(element, url) {
  element.href = url;
  element.textContent = url;
  element.title = url;
}

function deleteLink(id) {
  links = links.filter((link) => link.id !== id);
  renderLinks();
}

function showQr(link) {
  try {
    createQrCode(qrContainer, link.shortUrl, { size: 210, dotsType: 'square' });
  } catch {
    qrContainer.textContent = 'Не удалось загрузить QR-код';
  }
  qrDialog.showModal();
}

function renderPagination(pageCount) {
  pagination.replaceChildren();
  pagination.append(createPageButton('‹', currentPage - 1, currentPage === 1, 'Предыдущая страница'));
  for (let page = 1; page <= pageCount; page += 1) {
    const button = createPageButton(String(page), page, false, `Страница ${page}`);
    if (page === currentPage) button.classList.add('is-active');
    pagination.append(button);
  }
  pagination.append(createPageButton('›', currentPage + 1, currentPage === pageCount, 'Следующая страница'));
}

function createPageButton(label, page, disabled, ariaLabel) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.disabled = disabled;
  button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', () => { currentPage = page; renderLinks(); });
  return button;
}

document.querySelector('.dialog-close').addEventListener('click', () => qrDialog.close());
qrDialog.addEventListener('click', (event) => { if (event.target === qrDialog) qrDialog.close(); });
renderLinks();
