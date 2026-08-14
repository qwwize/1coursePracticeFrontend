const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('.password-toggle');
const emailInput = document.querySelector('#email');
const form = document.querySelector('.login-form');

passwordToggle.addEventListener('click', () => {
  const passwordIsVisible = passwordInput.type === 'text';

  passwordInput.type = passwordIsVisible ? 'password' : 'text';
  passwordToggle.setAttribute('aria-pressed', String(!passwordIsVisible));
  passwordToggle.setAttribute('aria-label', passwordIsVisible ? 'Показать пароль' : 'Скрыть пароль');
});

emailInput.addEventListener('input', () => emailInput.setCustomValidity(''));
passwordInput.addEventListener('input', () => passwordInput.setCustomValidity(''));

form.addEventListener('submit', (event) => {
  event.preventDefault();

  emailInput.setCustomValidity('');
  passwordInput.setCustomValidity('');

  if (!emailInput.value.trim()) {
    emailInput.setCustomValidity('Введите email');
  } else if (emailInput.validity.typeMismatch) {
    emailInput.setCustomValidity('Введите корректный email');
  }

  if (!passwordInput.value) {
    passwordInput.setCustomValidity('Введите пароль');
  }

  if (!form.reportValidity()) {
    return;
  }

  window.location.href = '/create-link.html';
});
