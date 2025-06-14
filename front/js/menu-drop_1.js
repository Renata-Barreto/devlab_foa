// js/menu-drop.js
async function carregarNavbar() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token || auth;

  try {
    const response = await fetch("navbar.html");
    const data = await response.text();
    const navbar = document.getElementById("navbar");
    if (navbar) {
      navbar.innerHTML = data;
      inicializarMenuHamburger();
    } else {
      console.warn('Elemento #navbar não encontrado.');
    }

    const profileDropdownList = document.querySelector(".profile-dropdown-list");
    const btn = document.querySelector(".profile-dropdown-btn");
    const nomeEntrar = document.getElementById("nome_entrar");

    if (!token) {
      if (nomeEntrar) {
        nomeEntrar.innerHTML = `Entrar`;
      }
      if (btn) {
        btn.addEventListener("click", () => {
          window.location.href = "login.html";
        });
        btn.querySelector(".profile-img").style.backgroundImage = `url('https://gabrielaccorsi.github.io/Projeto-SI/imagens/entrar.png')`;
      }
      return;
    }

    try {
      const userResponse = await fetch("http://localhost:3000/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        console.warn(`Erro ao carregar usuário: ${userResponse.status}`);
        // Não remover auth automaticamente, apenas logar o erro
        if (nomeEntrar) {
          nomeEntrar.innerHTML = `Usuário`;
        }
        return;
      }

      const { user } = await userResponse.json();
      console.log("Usuário carregado:", user);

      let nome = user.nome_usr || user.name || user.username || user.email?.split("@")[0] || "Usuário";
      nome = nome.split(" ")[0];
      nome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
      if (nome.length > 8) nome = nome.slice(0, 8) + "...";
      if (nomeEntrar) {
        nomeEntrar.innerHTML = `${nome} <i class="fa-solid fa-angle-down"></i>`;
      }

      const foto = user.img_usr || user.avatar || "https://gabrielaccorsi.github.io/Projeto-SI/imagens/entrar.png";
      if (btn) {
        btn.querySelector(".profile-img").style.backgroundImage = `url('${foto}')`;
      }

      if (btn && profileDropdownList) {
        btn.addEventListener("click", () => {
          profileDropdownList.classList.toggle("active");
        });
        window.addEventListener("click", (e) => {
          if (!btn.contains(e.target) && !profileDropdownList.contains(e.target)) {
            profileDropdownList.classList.remove("active");
          }
        });
      }

      // Tipo de usuário
      const tipo = user.tipo || "aluno";
      if (tipo === "adm") {
        const linkContato = document.querySelector("#link-contato");
        if (linkContato) {
          linkContato.setAttribute("href", "mensagens.html");
        }
      }

      const perfilBtn = document.querySelector("#Perfil");
      if (perfilBtn) {
        perfilBtn.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = tipo === "adm" ? "pagina_adm.html" : "pagina_aluno.html";
        });
      }

      const exitItem = document.getElementById("Deslogar");
      if (exitItem) {
        exitItem.addEventListener("click", () => {
          localStorage.removeItem("auth");
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      if (nomeEntrar) {
        nomeEntrar.innerHTML = `Usuário`;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar a navbar:", error);
  }
}

function inicializarMenuHamburger() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav_links");

  if (hamburgerMenu && navLinks) {
    hamburgerMenu.addEventListener("click", function (event) {
      event.stopPropagation();
      navLinks.classList.toggle("open");
    });

    document.addEventListener("click", function (event) {
      if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
        navLinks.classList.remove("open");
      }
    });
  } else {
    console.warn('Elementos .hamburger-menu ou .nav_links não encontrados.');
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarNavbar();
  inicializarMenuHamburger();
});
