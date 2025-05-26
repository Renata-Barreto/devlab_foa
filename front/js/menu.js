document.addEventListener('DOMContentLoaded', function () {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav_links');

    hamburgerMenu.addEventListener('click', function (event) {
      event.stopPropagation();
      navLinks.classList.toggle('open');
    });

    document.addEventListener('click', function (event) {
      if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
        navLinks.classList.remove('open');
      }
    });
  });
  function entrar() {
    document.getElementById('linkIndex').click();
  }