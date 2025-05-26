async function carregarNavbar() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token || auth;

  fetch("navbar.html")
    .then((response) => response.text())
    .then(async (data) => {
      document.getElementById("navbar").innerHTML = data;
      inicializarMenuHamburger();

      const profileDropdownList = document.querySelector(".profile-dropdown-list");
      const btn = document.querySelector(".profile-dropdown-btn");
      const nomeEntrar = document.getElementById("nome_entrar");

      if (!token) {
      
        nomeEntrar.innerHTML = `Entrar`;
        btn.addEventListener("click", () => {
          window.location.href = "login.html";
        });
        btn.querySelector(".profile-img").style.backgroundImage = `url('https://gabrielaccorsi.github.io/Projeto-SI/imagens/entrar.png')`;
        return;
      }

     
      const response = await fetch("http://localhost:3000/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("auth");
        window.location.reload();
        return;
      }

      const {user} = await response.json();

      console.log(user);

      let nome = user.name || user.username || user.email.split("@")[0];
      nome = nome.split(" ")[0];
      nome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
      if (nome.length > 8) nome = nome.slice(0, 8) + "...";
      nomeEntrar.innerHTML = `${nome} <i class="fa-solid fa-angle-down"></i>`;

      const foto = user.avatar || "https://gabrielaccorsi.github.io/Projeto-SI/imagens/entrar.png";
      document.querySelector(".profile-img").style.backgroundImage = `url('${foto}')`;

  


      btn.addEventListener("click", () => {
        profileDropdownList.classList.toggle("active");
      });
      window.addEventListener("click", (e) => {
        if (!btn.contains(e.target) && !profileDropdownList.contains(e.target)) {
          profileDropdownList.classList.remove("active");
        }
      });

      // Tipo de usuário
      const tipo = user.tipo || "aluno";
      if (tipo === "adm") {
        document.querySelector("#link-contato")?.setAttribute("href", "mensagens.html");
      }

      const perfilBtn = document.querySelector("#Perfil");
      if (perfilBtn) {
        perfilBtn.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = tipo === "adm" ? "pagina_adm.html" : "pagina_aluno.html";
        });
      }

      // Logout
      const exitItem = document.getElementById("Deslogar");
      if (exitItem) {
        exitItem.addEventListener("click", () => {
          localStorage.removeItem("auth");
          window.location.reload();
        });
      }
    })
    .catch((error) => console.error("Erro ao carregar a navbar:", error));
}


// menu hambúrguer
function inicializarMenuHamburger() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav_links");

  if (hamburgerMenu && navLinks) {
    hamburgerMenu.addEventListener("click", function (event) {
      event.stopPropagation();
      navLinks.classList.toggle("open");
    });

    document.addEventListener("click", function (event) {
      if (
        !navLinks.contains(event.target) &&
        !hamburgerMenu.contains(event.target)
      ) {
        navLinks.classList.remove("open");
      }
    });
  }
}

// Inicializa a navbar ao carregar a página
document.addEventListener("DOMContentLoaded", carregarNavbar, inicializarMenuHamburger) ;
