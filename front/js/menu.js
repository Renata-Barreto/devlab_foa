// js/menu.js
document.addEventListener('DOMContentLoaded', function () {
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  const navLinks = document.querySelector('.nav_links');

  if (hamburgerMenu && navLinks) {
    hamburgerMenu.addEventListener('click', function (event) {
      event.stopPropagation();
      navLinks.classList.toggle('open');
    });

    document.addEventListener('click', function (event) {
      if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
        navLinks.classList.remove('open');
      }
    });
  } else {
    console.warn('Elementos .hamburger-menu ou .nav_links não encontrados.');
  }
});

function entrar() {
  const linkIndex = document.getElementById('linkIndex');
  if (linkIndex) {
    linkIndex.click();
  } else {
    console.warn('Elemento #linkIndex não encontrado.');
    window.location.href = 'index.html'; // Fallback
  }
}

