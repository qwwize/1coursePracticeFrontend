const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('.password-toggle');

passwordToggle.addEventListener('click', () => {
  const passwordIsVisible = passwordInput.type === 'text';

  passwordInput.type = passwordIsVisible ? 'password' : 'text';
  passwordToggle.setAttribute('aria-pressed', String(!passwordIsVisible));
  passwordToggle.setAttribute('aria-label', passwordIsVisible ? 'Показать пароль' : 'Скрыть пароль');
});

document.querySelector('.login-form').addEventListener('submit', (event) => {
  event.preventDefault();
});
