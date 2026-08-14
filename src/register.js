const form = document.querySelector('.register-form');
const passwordInput = document.querySelector('#register-password');
const passwordConfirmationInput = document.querySelector('#password-confirmation');
const accountNameInput = document.querySelector('#account-name');
const emailInput = document.querySelector('#register-email');

document.querySelectorAll('[data-password-toggle]').forEach((toggleButton) => {
  const input = document.querySelector(`#${toggleButton.dataset.passwordToggle}`);

  toggleButton.addEventListener('click', () => {
    const passwordIsVisible = input.type === 'text';

    input.type = passwordIsVisible ? 'password' : 'text';
    toggleButton.setAttribute('aria-pressed', String(!passwordIsVisible));
    toggleButton.setAttribute('aria-label', passwordIsVisible ? 'Показать пароль' : 'Скрыть пароль');
  });
});

function validatePasswordConfirmation() {
  const passwordsMatch = passwordInput.value === passwordConfirmationInput.value;
  passwordConfirmationInput.setCustomValidity(passwordsMatch ? '' : 'Пароли не совпадают');
}

passwordInput.addEventListener('input', () => {
  passwordInput.setCustomValidity('');
  validatePasswordConfirmation();
});
passwordConfirmationInput.addEventListener('input', validatePasswordConfirmation);
accountNameInput.addEventListener('input', () => accountNameInput.setCustomValidity(''));
emailInput.addEventListener('input', () => emailInput.setCustomValidity(''));

form.addEventListener('submit', (event) => {
  event.preventDefault();

  accountNameInput.setCustomValidity(accountNameInput.value.trim() ? '' : 'Введите имя аккаунта');
  emailInput.setCustomValidity('');

  if (!emailInput.value.trim()) {
    emailInput.setCustomValidity('Введите email');
  } else if (emailInput.validity.typeMismatch) {
    emailInput.setCustomValidity('Введите корректный email');
  }

  passwordInput.setCustomValidity(passwordInput.value ? '' : 'Введите пароль');
  validatePasswordConfirmation();

  if (!form.reportValidity()) {
    return;
  }

  window.location.href = '/create-link.html';
});
