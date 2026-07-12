// Минималистичный сокращатель ссылок

// ===== НАСТРОЙКИ =====
const USE_MOCK = false;  // false - используем реальный API
const API_URL = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Приложение загружено');

  // DOM
  const urlInput = document.getElementById('url-input');
  const shortenBtn = document.getElementById('shorten-btn');
  const tbody = document.getElementById('links-tbody');
  const emptyState = document.getElementById('empty-state');
  const linksCount = document.getElementById('links-count');
  const clearBtn = document.getElementById('clear-btn');
  
  const qrContainer = document.getElementById('qr');
  const qrGenerate = document.getElementById('qr-generate-btn');
  const qrDownload = document.getElementById('qr-download-btn');
  const qrSettingsToggle = document.getElementById('qr-settings-toggle');
  const qrSettings = document.getElementById('qr-settings');
  const qrApply = document.getElementById('qr-apply');
  const qrColor = document.getElementById('qr-color');
  const qrDots = document.getElementById('qr-dots');
  const qrSize = document.getElementById('qr-size');
  const qrLogo = document.getElementById('qr-logo');

  let links = [];
  let qrInstance = null;
  let qrData = null;

  // ===== Вспомогательные =====
  function getShortLink(code) {
    // Для локальной разработки
    if (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) {
      return `http://localhost:8000/${code}`;
    }
    return window.location.origin + '/' + code;
  }

  function normalizeUrl(url) {
    url = url.trim();
    if (!url) return null;
    if (/^https?:\/\//.test(url)) return url;
    if (/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}/.test(url)) return 'https://' + url;
    return 'https://' + url;
  }

  function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
  }

  function showMessage(text, type = 'info') {
    const el = document.getElementById('msg') || (() => {
      const d = document.createElement('div');
      d.id = 'msg';
      d.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:8px;font-size:14px;z-index:999;transition:all 0.3s;opacity:0;background:#1a1a2e;color:#e8e8f0;border:1px solid #2d2d44;max-width:90%;text-align:center;pointer-events:none';
      document.body.appendChild(d);
      return d;
    })();
    el.textContent = text;
    el.style.opacity = '1';
    el.style.borderColor = type === 'error' ? '#e17055' : type === 'success' ? '#00b894' : '#2d2d44';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.style.opacity = '0', 3000);
  }

  // ===== API =====
  async function createShortUrl(original) {
    console.log('📝 Создание ссылки для:', original);
    
    if (USE_MOCK) {
      console.log('🎭 Используем МОК-режим');
      return new Promise((resolve) => {
        setTimeout(() => {
          const data = {
            id: generateShortCode(),
            url: original,
            created_at: new Date().toISOString()
          };
          console.log('✅ Мок-данные созданы:', data);
          links.unshift(data);
          renderLinks();
          updateStats();
          const short = getShortLink(data.id);
          qrData = short;
          generateQR(short);
          showMessage('✅ Ссылка создана (мок)', 'success');
          resolve(data);
        }, 500);
      });
    }

    // Реальный API
    try {
      const requestData = { url: original };
      console.log('📤 Отправка запроса к API:', API_URL + '/post/url');
      console.log('📦 Данные:', requestData);
      
      const res = await fetch(API_URL + '/post/url', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Статус ответа:', res.status);
      console.log('📥 Заголовки:', [...res.headers.entries()]);

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Ответ сервера:', data);
        
        // Проверяем, что данные корректные
        if (!data.id || !data.url) {
          console.error('❌ Некорректный ответ сервера:', data);
          showMessage('❌ Некорректный ответ сервера', 'error');
          return null;
        }

        // Добавляем created_at для совместимости с фронтендом
        const linkData = {
          id: data.id,
          url: data.url,
          created_at: new Date().toISOString()
        };
        
        links.unshift(linkData);
        renderLinks();
        updateStats();
        
        const short = getShortLink(data.id);
        qrData = short;
        generateQR(short);
        showMessage('✅ Ссылка создана', 'success');
        return data;
      } else {
        let errorText = '';
        try {
          const err = await res.json();
          errorText = err.detail || JSON.stringify(err);
        } catch {
          errorText = await res.text();
        }
        console.error('❌ Ошибка сервера:', res.status, errorText);
        showMessage(`❌ Ошибка ${res.status}: ${errorText}`, 'error');
        return null;
      }
    } catch (e) {
      console.error('❌ Ошибка запроса:', e);
      showMessage('❌ Ошибка соединения с сервером', 'error');
      return null;
    }
  }

  // ===== Рендеринг =====
  function renderLinks() {
    console.log('🔄 Рендеринг ссылок, всего:', links.length);
    
    const template = document.getElementById('row-template');
    if (!template) {
      console.error('❌ Template не найден!');
      return;
    }

    if (!tbody) {
      console.error('❌ Tbody не найден!');
      return;
    }

    tbody.innerHTML = '';
    
    if (!links.length) {
      if (emptyState) emptyState.style.display = 'block';
      console.log('📭 Нет ссылок для отображения');
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    links.forEach((link, index) => {
      const clone = document.importNode(template.content, true);
      const row = clone.querySelector('tr');
      
      if (!row) {
        console.error('❌ Row не найден в template');
        return;
      }

      const originalCell = row.querySelector('.original');
      const shortCell = row.querySelector('.short');
      const copyBtn = row.querySelector('.copy-btn');
      const qrBtn = row.querySelector('.qr-btn');
      const deleteBtn = row.querySelector('.delete-btn');

      const original = link.url.length > 50 ? link.url.slice(0, 50) + '…' : link.url;
      if (originalCell) {
        originalCell.textContent = original;
        originalCell.title = link.url;
      }

      const short = getShortLink(link.id);
      if (shortCell) {
        shortCell.textContent = short;
        shortCell.title = short;
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(short).then(() => {
            showMessage('✅ Скопировано!', 'success');
          }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = short;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            showMessage('✅ Скопировано!', 'success');
          });
        });
      }

      if (qrBtn) {
        qrBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          qrData = short;
          generateQR(short);
          showMessage('QR обновлён');
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Удалить ссылку?')) {
            links = links.filter(l => l.id !== link.id);
            renderLinks();
            updateStats();
            showMessage('Удалено');
          }
        });
      }
      
      tbody.appendChild(row);
    });
    saveLinks();
    console.log('✅ Рендеринг завершён');
  }

  function updateStats() {
    if (linksCount) {
      linksCount.textContent = links.length;
      console.log('📊 Статистика обновлена:', links.length);
    }
  }

  // ===== QR =====
  function generateQR(data) {
    console.log('🎯 Генерация QR для:', data);
    
    if (!qrContainer) {
      console.error('❌ qrContainer не найден');
      return;
    }

    qrContainer.innerHTML = '';
    
    if (qrInstance) {
      try {
        if (typeof qrInstance.clear === 'function') {
          qrInstance.clear();
        }
      } catch (e) {
        console.warn('⚠️ Ошибка при очистке QR:', e);
      }
      qrInstance = null;
    }
    
    qrData = data;
    
    try {
      const color = qrColor?.value || '#000000';
      const dotsType = qrDots?.value || 'rounded';
      const size = parseInt(qrSize?.value) || 200;
      const logo = qrLogo?.value || '';

      console.log('🎨 Настройки QR:', { color, dotsType, size, logo });

      const opts = {
        width: size,
        height: size,
        type: 'canvas',
        data: data,
        dotsOptions: {
          color: color,
          type: dotsType
        },
        backgroundOptions: { color: '#ffffff' },
        cornersSquareOptions: {
          color: color,
          type: 'extra-rounded'
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 15,
          imageSize: 0.35,
          hideBackgroundDots: true
        },
        qrOptions: { errorCorrectionLevel: 'H' }
      };
      
      if (logo) opts.image = logo;
      
      qrInstance = new QRCodeStyling(opts);
      qrInstance.append(qrContainer);
      console.log('✅ QR создан успешно');
    } catch (e) {
      console.error('❌ Ошибка генерации QR:', e);
      qrContainer.innerHTML = '❌ Ошибка: ' + e.message;
    }
  }

  // ===== Хранилище =====
  function saveLinks() {
    try {
      localStorage.setItem('short_links', JSON.stringify(links));
      console.log('💾 Ссылки сохранены');
    } catch (e) {
      console.warn('⚠️ Не удалось сохранить ссылки:', e);
    }
  }

  function loadLinks() {
    try {
      const saved = localStorage.getItem('short_links');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          links = parsed;
          renderLinks();
          updateStats();
          console.log('📂 Загружено сохранённых ссылок:', links.length);
          return true;
        }
      }
    } catch (e) {
      console.warn('⚠️ Не удалось загрузить ссылки:', e);
    }
    return false;
  }

  // ===== Проверка сервера =====
  async function checkServer() {
    try {
      console.log('🔍 Проверка сервера:', API_URL);
      const res = await fetch(API_URL, {
        method: 'GET',
        mode: 'cors'
      });
      console.log('✅ Сервер доступен, статус:', res.status);
      return true;
    } catch (e) {
      console.error('❌ Сервер недоступен:', e.message);
      return false;
    }
  }

  // ===== События =====
  if (shortenBtn && urlInput) {
    shortenBtn.addEventListener('click', async () => {
      console.log('🔘 Нажата кнопка "Сократить"');
      const raw = urlInput.value.trim();
      if (!raw) { 
        showMessage('Введите ссылку', 'error'); 
        return; 
      }
      const normalized = normalizeUrl(raw);
      if (!normalized) { 
        showMessage('Некорректная ссылка', 'error'); 
        return; 
      }
      try { 
        new URL(normalized); 
      } catch { 
        showMessage('Некорректная ссылка', 'error'); 
        return; 
      }
      
      shortenBtn.textContent = '⏳';
      shortenBtn.disabled = true;
      await createShortUrl(normalized);
      urlInput.value = '';
      shortenBtn.textContent = 'Сократить';
      shortenBtn.disabled = false;
      urlInput.focus();
    });

    urlInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        shortenBtn.click();
      }
    });
  }

  if (qrGenerate) {
    qrGenerate.addEventListener('click', () => {
      console.log('🔘 Нажата кнопка "Обновить QR"');
      if (links.length) {
        qrData = getShortLink(links[0].id);
        generateQR(qrData);
        showMessage('QR обновлён');
      } else {
        qrData = 'https://example.com';
        generateQR('https://example.com');
        showMessage('Демо QR', 'info');
      }
    });
  }

  if (qrDownload) {
    qrDownload.addEventListener('click', () => {
      console.log('🔘 Нажата кнопка "Скачать QR"');
      if (!qrInstance) { 
        showMessage('Сгенерируйте QR', 'error'); 
        return; 
      }
      try {
        qrInstance.download({ name: 'qr', extension: 'png' });
        showMessage('Скачивание…', 'success');
      } catch (e) {
        console.error('❌ Ошибка скачивания:', e);
        showMessage('Ошибка', 'error');
      }
    });
  }

  if (qrSettingsToggle && qrSettings) {
    qrSettingsToggle.addEventListener('click', () => {
      const isVisible = qrSettings.style.display !== 'none';
      qrSettings.style.display = isVisible ? 'none' : 'block';
      console.log('🔘 Настройки QR:', isVisible ? 'скрыты' : 'показаны');
    });
  }

  if (qrApply) {
    qrApply.addEventListener('click', () => {
      console.log('🔘 Нажата кнопка "Применить настройки"');
      if (qrData) {
        generateQR(qrData);
        if (qrSettings) qrSettings.style.display = 'none';
        showMessage('Настройки применены', 'success');
      } else {
        showMessage('Сначала сгенерируйте QR', 'error');
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!links.length) return;
      if (confirm('Удалить все ссылки?')) {
        console.log('🗑️ Очистка всех ссылок');
        links = [];
        renderLinks();
        updateStats();
        showMessage('Все удалены');
      }
    });
  }

  // ===== Инициализация =====
  console.log('🚀 Инициализация приложения');
  
  // Загружаем сохранённые ссылки
  if (!loadLinks()) {
    renderLinks();
    updateStats();
  }

  // Проверка сервера
  setTimeout(async () => {
    if (!USE_MOCK) {
      const isServerOk = await checkServer();
      if (isServerOk) {
        showMessage('✅ Сервер доступен', 'success');
      } else {
        showMessage('⚠️ Сервер не отвечает. Проверьте Docker', 'error');
      }
    }
  }, 500);

  // Демо QR
  setTimeout(() => {
    console.log('🎯 Генерация демо QR');
    if (links.length) {
      qrData = getShortLink(links[0].id);
      generateQR(qrData);
    } else {
      qrData = 'https://example.com';
      generateQR('https://example.com');
    }
  }, 300);

  // Индикатор режима
  const indicator = document.createElement('div');
  indicator.style.cssText = 'text-align:center;font-size:11px;color:#7a7a9a;margin-top:12px;padding:4px;background:#1e1e3a;border-radius:4px';
  indicator.textContent = USE_MOCK ? '⚡ МОК-РЕЖИМ (без сервера)' : '🔗 API: ' + API_URL;
  const main = document.querySelector('.main');
  if (main) main.appendChild(indicator);

  console.log('✅ Приложение готово к работе!');
});