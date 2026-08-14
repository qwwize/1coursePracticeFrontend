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
