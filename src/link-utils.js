const LINKS_STORAGE_KEY = 'short_links';

export function normalizeUrl(value) {
  const url = value.trim();

  if (!url) {
    return null;
  }

  const urlWithProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  try {
    return new URL(urlWithProtocol).href;
  } catch {
    return null;
  }
}

export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

export function loadLinks() {
  try {
    const savedLinks = localStorage.getItem(LINKS_STORAGE_KEY);
    const parsedLinks = savedLinks ? JSON.parse(savedLinks) : [];

    return Array.isArray(parsedLinks) ? parsedLinks : [];
  } catch {
    return [];
  }
}

export function saveLinks(links) {
  localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(links));
}

export function hasSavedLinks() {
  return localStorage.getItem(LINKS_STORAGE_KEY) !== null;
}

export function removeLink(links, linkId) {
  return links.filter((link) => link.id !== linkId);
}
