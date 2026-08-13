const form = document.querySelector('.register-form');
const passwordInput = document.querySelector('#register-password');
const passwordConfirmationInput = document.querySelector('#password-confirmation');

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

passwordInput.addEventListener('input', validatePasswordConfirmation);
passwordConfirmationInput.addEventListener('input', validatePasswordConfirmation);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  validatePasswordConfirmation();
  form.reportValidity();
});
