import { loadLinks } from './link-utils.js';

const selectedLinkId = new URLSearchParams(window.location.search).get('id');
const selectedLink = loadLinks().find((link) => String(link.id) === selectedLinkId);

if (selectedLink) {
  document.body.dataset.linkId = String(selectedLink.id);
}

const paginationButtons = document.querySelectorAll('.pagination button');
const numberedButtons = [...paginationButtons].slice(1, -1);

numberedButtons.forEach((button) => {
  button.addEventListener('click', () => {
    numberedButtons.forEach((item) => {
      item.classList.remove('is-active');
      item.removeAttribute('aria-current');
    });
    button.classList.add('is-active');
    button.setAttribute('aria-current', 'page');
  });
});
