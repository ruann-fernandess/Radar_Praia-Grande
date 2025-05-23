const toggleSenhaBtn = document.getElementById('toggleSenha');
const senhaInput = document.getElementById('senha');
const icon = toggleSenhaBtn.querySelector('i');

toggleSenhaBtn.addEventListener('click', () => {
  if (senhaInput.type === 'password') {
    senhaInput.type = 'text';
    icon.classList.remove('bi-eye-fill');
    icon.classList.add('bi-eye-slash-fill');
  } else {
    senhaInput.type = 'password';
    icon.classList.remove('bi-eye-slash-fill');
    icon.classList.add('bi-eye-fill');
  }
});
