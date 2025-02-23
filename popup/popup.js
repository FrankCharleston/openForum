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

document.getElementById('settingsButton').addEventListener('click', () => {
  const popupContent = document.getElementById('popupContent');
  const optionsFrame = document.getElementById('optionsFrame');
  if (optionsFrame.style.display === 'none') {
    optionsFrame.style.display = 'block';
    popupContent.style.display = 'none';
  } else {
    optionsFrame.style.display = 'none';
    popupContent.style.display = 'block';
  }
});

document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

document.getElementById('helpButton').addEventListener('click', () => {
  const popupContent = document.getElementById('popupContent');
  const helpContent = document.getElementById('helpContent');
  if (helpContent.style.display === 'none') {
    helpContent.style.display = 'block';
    popupContent.style.display = 'none';
  } else {
    helpContent.style.display = 'none';
    popupContent.style.display = 'block';
  }
});

document.getElementById('feedbackButton').addEventListener('click', () => {
  const popupContent = document.getElementById('popupContent');
  const feedbackContent = document.getElementById('feedbackContent');
  if (feedbackContent.style.display === 'none') {
    feedbackContent.style.display = 'block';
    popupContent.style.display = 'none';
  } else {
    feedbackContent.style.display = 'none';
    popupContent.style.display = 'block';
  }
});

document.getElementById('themeButton').addEventListener('click', () => {
  const popupContent = document.getElementById('popupContent');
  const themeContent = document.getElementById('themeContent');
  if (themeContent.style.display === 'none') {
    themeContent.style.display = 'block';
    popupContent.style.display = 'none';
  } else {
    themeContent.style.display = 'none';
    popupContent.style.display = 'block';
  }
});

document.getElementById('feedbackForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const feedbackText = document.getElementById('feedbackText').value;
  console.log('Feedback submitted:', feedbackText);
  alert('Thank you for your feedback!');
  document.getElementById('feedbackContent').style.display = 'none';
  document.getElementById('popupContent').style.display = 'block';
});

document.getElementById('themeSelector').addEventListener('change', (event) => {
  const theme = event.target.value;
  document.body.className = theme;
});
