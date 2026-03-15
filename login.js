/* ================================================
   LOGIN.JS — Login page logic
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  if (AUTH.getSession()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Hide loader
  setTimeout(() => {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('hidden');
  }, 800);

  // Create particles
  createParticles('particles', 35);

  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    const btn      = document.getElementById('loginBtn');
    const errBox   = document.getElementById('loginError');
    const errMsg   = document.getElementById('loginErrorMsg');
    const ipErr    = document.getElementById('ipError');

    if (!username || !password) {
      errMsg.textContent = 'Username dan password wajib diisi.';
      errBox.style.display = 'flex'; ipErr.style.display = 'none'; return;
    }

    // Show loading state
    btn.querySelector('.btn-text').style.display = 'none';
    btn.querySelector('.btn-loader').style.display = 'flex';
    btn.disabled = true;
    errBox.style.display = 'none';
    ipErr.style.display  = 'none';

    const result = await AUTH.login(username, password);

    btn.querySelector('.btn-text').style.display = 'flex';
    btn.querySelector('.btn-loader').style.display = 'none';
    btn.disabled = false;

    if (!result.ok) {
      if (result.ipBlocked) {
        ipErr.style.display = 'flex';
      } else {
        errMsg.textContent = result.msg;
        errBox.style.display = 'flex';
      }
      // Shake card
      const card = document.querySelector('.login-card');
      card.style.animation = 'none';
      card.style.transform = 'translateX(-8px)';
      setTimeout(() => { card.style.transform = 'translateX(8px)'; }, 80);
      setTimeout(() => { card.style.transform = 'translateX(0)'; card.style.transition = 'transform .3s'; }, 160);
      return;
    }

    // Success
    btn.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
    btn.style.background = 'linear-gradient(135deg, var(--green), var(--green2))';
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
  });
});
