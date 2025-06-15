// src/front/js/menu-drop.js
async function carregarNavbar() {
  console.log("Iniciando carregarNavbar - Timestamp:", new Date().toISOString());

  const authRaw = localStorage.getItem("auth");
  console.log("authRaw:", authRaw);
  let auth, token;
  try {
    auth = authRaw ? JSON.parse(authRaw) : null;
    token = auth?.token || null;
    console.log("Autenticação parseada:", auth);
  } catch (parseError) {
    console.error("Erro ao parsear auth:", parseError.message);
    token = null;
  }

  try {
    const response = await fetch("/navbar.html");
    if (!response.ok) {
      throw new Error(`Erro ao carregar navbar: ${response.status} ${response.statusText}`);
    }
    const data = await response.text();
    const navbar = document.getElementById("navbar");
    if (navbar) {
      navbar.innerHTML = data;
      console.log("Navbar HTML carregado com sucesso.");
    } else {
      console.warn("Elemento #navbar não encontrado no DOM.");
      inicializarMenuHamburger();
      return;
    }

    // Selecionar elementos após carregar o HTML
    const profileDropdownList = document.querySelector(".profile-dropdown-list");
    const btn = document.querySelector(".profile-dropdown-btn");
    const nomeEntrar = document.getElementById("nome_entrar");
    const profileImg = btn?.querySelector(".profile-img");
    const linkContato = document.querySelector("#link-contato");
    const perfilBtn = document.querySelector("#Perfil");
    const exitItem = document.getElementById("Deslogar");

    if (!btn) console.warn("Elemento .profile-dropdown-btn não encontrado.");
    if (!profileDropdownList) console.warn("Elemento .profile-dropdown-list não encontrado.");
    if (!nomeEntrar) console.warn("Elemento #nome_entrar não encontrado.");
    if (!profileImg) console.warn("Elemento .profile-img não encontrado.");
    if (!linkContato) console.warn("Elemento #link-contato não encontrado.");
    if (!perfilBtn) console.warn("Elemento #Perfil não encontrado.");
    if (!exitItem) console.warn("Elemento #Deslogar não encontrado.");

    if (!token) {
      if (nomeEntrar) {
        nomeEntrar.innerHTML = `Entrar <i class="fa-solid fa-angle-down"></i>`;
      }
      if (btn && profileImg) {
        profileImg.style.backgroundImage = `url('/Uploads/avatar-padrao.png')`;
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          console.log("Botão de login clicado, redirecionando para /login.html");
          window.location.href = "/login.html";
        });
      }
      inicializarMenuHamburger();
      return;
    }

    try {
      console.log("Enviando requisição para GET /api/users");
      const userResponse = await fetch("/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Status da resposta:", userResponse.status, userResponse.statusText);

      if (!userResponse.ok) {
        console.warn(`Erro ao carregar usuário: ${userResponse.status}`);
        const errorData = await userResponse.json().catch(() => ({}));
        console.error("Detalhes do erro:", errorData);
        if (nomeEntrar) {
          nomeEntrar.innerHTML = `Usuário <i class="fa-solid fa-angle-down"></i>`;
        }
        if (profileImg) {
          profileImg.style.backgroundImage = `url('/Uploads/avatar-padrao.png')`;
        }
        inicializarMenuHamburger();
        return;
      }

      const responseData = await userResponse.json();
      const user = responseData.user || responseData; // Compatível com { user: {...} } ou direta
      console.log("Usuário carregado:", user);

      let nome = user.nome_usr || user.name || user.username || user.email?.split("@")[0] || "Usuário";
      nome = nome.split(" ")[0];
      nome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
      if (nome.length > 8) nome = nome.slice(0, 8) + "...";
      if (nomeEntrar) {
        nomeEntrar.innerHTML = `${nome} <i class="fa-solid fa-angle-down"></i>`;
      }

      const foto = user.img_usr ? user.img_usr : "/Uploads/avatar-padrao.png";
      if (profileImg) {
        profileImg.style.backgroundImage = `url('${foto}')`;
        const img = new Image();
        img.onerror = () => {
          console.warn(`Falha ao carregar imagem: ${foto}`);
          profileImg.style.backgroundImage = `url('/Uploads/avatar-padrao.png')`;
        };
        img.src = foto;
      }

      if (btn && profileDropdownList) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          console.log("Dropdown clicado, toggling active:", !profileDropdownList.classList.contains("active"));
          profileDropdownList.classList.toggle("active");
        });
        window.addEventListener("click", (e) => {
          if (!btn.contains(e.target) && !profileDropdownList.contains(e.target)) {
            console.log("Fechando dropdown por clique fora");
            profileDropdownList.classList.remove("active");
          }
        });
      }

      const tipo = user.tipo || auth?.userTipo || "aluno";
      if (tipo === "adm" && linkContato) {
        linkContato.setAttribute("href", "/mensagens.html");
        console.log("Link #link-contato atualizado para /mensagens.html (admin)");
      }

      if (perfilBtn) {
        perfilBtn.addEventListener("click", (e) => {
          e.preventDefault();
          const destino = tipo === "adm" ? "/pagina_adm.html" : "/pagina_aluno.html";
          console.log("Botão #Perfil clicado, redirecionando para:", destino);
          window.location.href = destino;
        });
      }

      if (exitItem) {
        exitItem.addEventListener("click", (e) => {
          e.preventDefault();
          console.log("Botão #Deslogar clicado, removendo auth e recarregando");
          localStorage.removeItem("auth");
          window.location.href = "/login.html";
        });
      }

      inicializarMenuHamburger();
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error.message);
      if (nomeEntrar) {
        nomeEntrar.innerHTML = `Usuário <i class="fa-solid fa-angle-down"></i>`;
      }
      if (profileImg) {
        profileImg.style.backgroundImage = `url('/Uploads/avatar-padrao.png')`;
      }
      inicializarMenuHamburger();
    }
  } catch (error) {
    console.error("Erro ao carregar a navbar:", error.message);
    inicializarMenuHamburger();
  }
}

function inicializarMenuHamburger() {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const navLinks = document.querySelector(".nav_links");

  if (hamburgerMenu && navLinks) {
    hamburgerMenu.addEventListener("click", (event) => {
      event.stopPropagation();
      navLinks.classList.toggle("open");
      console.log("Hamburger menu clicado, estado:", navLinks.classList.contains("open"));
    });

    document.addEventListener("click", (event) => {
      if (!navLinks.contains(event.target) && !hamburgerMenu.contains(event.target)) {
        navLinks.classList.remove("open");
        console.log("Fechando nav_links por clique fora");
      }
    });
    console.log("Menu hambúrguer inicializado com sucesso.");
  } else {
    console.warn("Elementos .hamburger-menu ou .nav_links não encontrados no DOM.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado, iniciando carregarNavbar - Timestamp:", new Date().toISOString());
  carregarNavbar();
});

// // front/js/menu-drop.js
// async function carregarNavbar() {
//   const auth = JSON.parse(localStorage.getItem("auth"));
//   const token = auth?.token || auth;
//   console.log("Autenticação encontrada:", auth);

//   try {
//     const response = await fetch("navbar.html");
//     if (!response.ok) {
//       throw new Error(`Erro ao carregar navbar: ${response.status}`);
//     }
//     const data = await response.text();
//     const navbar = document.getElementById("navbar");
//     if (navbar) {
//       navbar.innerHTML = data;
//     } else {
//       console.warn("Elemento #navbar não encontrado.");
//       return;
//     }

//     // Selecionar elementos após carregar o HTML
//     const profileDropdownList = document.querySelector(".profile-dropdown-list");
//     const btn = document.querySelector(".profile-dropdown-btn");
//     const nomeEntrar = document.getElementById("nome_entrar");
//     const profileImg = btn?.querySelector(".profile-img");

//     if (!btn || !profileDropdownList) {
//       console.warn("Elementos .profile-dropdown-btn ou .profile-dropdown-list não encontrados.");
//       inicializarMenuHamburger();
//       return;
//     }

//     if (!token) {
//       if (nomeEntrar) {
//         nomeEntrar.innerHTML = `Entrar <i class="fa-solid fa-angle-down"></i>`;
//       }
//       if (btn && profileImg) {
//         profileImg.style.backgroundImage = `url('imagens/entrar.png')`;
//         btn.addEventListener("click", (e) => {
//           e.stopPropagation();
//           console.log("Botão de login clicado");
//           window.location.href = "login.html";
//         });
//       }
//       inicializarMenuHamburger();
//       return;
//     }

//     try {
//       const userResponse = await fetch("http://localhost:3000/api/users/", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!userResponse.ok) {
//         console.warn(`Erro ao carregar usuário: ${userResponse.status}`);
//         if (nomeEntrar) {
//           nomeEntrar.innerHTML = `Usuário <i class="fa-solid fa-angle-down"></i>`;
//         }
//         if (profileImg) {
//           profileImg.style.backgroundImage = `url('imagens/entrar.png')`;
//         }
//         inicializarMenuHamburger();
//         return;
//       }

//       const responseData = await userResponse.json();
//       const user = responseData.user || responseData; // Ajuste para estrutura { user: {...} } ou direta
//       console.log("Usuário carregado:", user);

//       let nome = user.nome_usr || user.name || user.username || user.email?.split("@")[0] || "Usuário";
//       nome = nome.split(" ")[0];
//       nome = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
//       if (nome.length > 8) nome = nome.slice(0, 8) + "...";
//       if (nomeEntrar) {
//         nomeEntrar.innerHTML = `${nome} <i class="fa-solid fa-angle-down"></i>`;
//       }

//       const foto = user.img_usr ? `http://localhost:3000${user.img_usr}` : "imagens/entrar.png";
//       if (profileImg) {
//         profileImg.style.backgroundImage = `url('${foto}')`;
//         const img = new Image();
//         img.onerror = () => {
//           console.warn(`Falha ao carregar imagem: ${foto}`);
//           profileImg.style.backgroundImage = `url('imagens/entrar.png')`;
//         };
//         img.src = foto;
//       }

//       if (btn && profileDropdownList) {
//         btn.addEventListener("click", (e) => {
//           e.stopPropagation();
//           console.log("Dropdown clicado, estado atual:", profileDropdownList.classList.contains("active"));
//           profileDropdownList.classList.toggle("active");
//         });
//         window.addEventListener("click", (e) => {
//           if (!btn.contains(e.target) && !profileDropdownList.contains(e.target)) {
//             console.log("Fechando dropdown por clique fora");
//             profileDropdownList.classList.remove("active");
//           }
//         });
//       }

//       const tipo = user.tipo || auth?.userTipo || "aluno";
//       if (tipo === "adm") {
//         const linkContato = document.querySelector("#link-contato");
//         if (linkContato) {
//           linkContato.setAttribute("href", "mensagens.html");
//         }
//       }

//       const perfilBtn = document.querySelector("#Perfil");
//       if (perfilBtn) {
//         perfilBtn.addEventListener("click", (e) => {
//           e.preventDefault();
//           window.location.href = tipo === "adm" ? "pagina_adm.html" : "pagina_aluno.html";
//         });
//       }

//       const exitItem = document.getElementById("Deslogar");
//       if (exitItem) {
//         exitItem.addEventListener("click", (e) => {
//           e.preventDefault();
//           localStorage.removeItem("auth");
//           window.location.reload();
//         });
//       }

//       inicializarMenuHamburger();
//     } catch (error) {
//       console.error("Erro ao carregar dados do usuário:", error);
//       if (nomeEntrar) {
//         nomeEntrar.innerHTML = `Usuário <i class="fa-solid fa-angle-down"></i>`;
//       }
//       if (profileImg) {
//         profileImg.style.backgroundImage = `url('imagens/entrar.png')`;
//       }
//       inicializarMenuHamburger();
//     }
//   } catch (error) {
//     console.error("Erro ao carregar a navbar:", error);
//     inicializarMenuHamburger();
//   }
// }

// function inicializarMenuHamburger() {
//   const hamburgerMenu = document.querySelector(".hamburger-menu");
//   const navLinks = document.querySelector(".nav_links");

//   if (hamburgerMenu && navLinks) {
//     const newHamburgerMenu = hamburgerMenu.cloneNode(true);
//     hamburgerMenu.parentNode.replaceChild(newHamburgerMenu, hamburgerMenu);
//     newHamburgerMenu.addEventListener("click", (event) => {
//       event.stopPropagation();
//       navLinks.classList.toggle("open");
//       console.log("Hamburger menu clicado, estado:", navLinks.classList.contains("open"));
//     });

//     document.addEventListener("click", (event) => {
//       if (!navLinks.contains(event.target) && !newHamburgerMenu.contains(event.target)) {
//         navLinks.classList.remove("open");
//       }
//     });
//   } else {
//     console.warn("Elementos .hamburger-menu ou .nav_links não encontrados.");
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("DOM carregado, iniciando carregarNavbar");
//   carregarNavbar();
// });