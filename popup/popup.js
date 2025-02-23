// ...existing code...

document.getElementById('togglePassword').addEventListener('click', () => {
  const passwordField = document.getElementById('password');
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  // Toggle the eye icon
  const eyeIcon = document.getElementById('togglePasswordIcon');
  eyeIcon.classList.toggle('fa-eye');
  eyeIcon.classList.toggle('fa-eye-slash');
});
