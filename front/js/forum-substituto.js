// src/front/js/forum-substituto.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("Iniciando forum-substituto.js - Timestamp:", new Date().toISOString());

  const buttons = document.querySelectorAll(".tab-button");
  const searchInput = document.getElementById("search-input");
  const postContainer = document.getElementById("post-container");
  const createTopicForm = document.getElementById("create-topic-form");
  const createTopicModal = document.getElementById("create-topic-modal");
  const openModalLink = document.querySelector(".create-topic-link");
  const cancelButton = document.querySelector(".modal-content .cancel");

  if (!buttons.length) console.warn("Nenhum elemento .tab-button encontrado no DOM.");
  if (!searchInput) console.warn("Elemento #search-input não encontrado no DOM.");
  if (!postContainer) console.warn("Elemento #post-container não encontrado no DOM.");
  if (!createTopicForm) console.warn("Elemento #create-topic-form não encontrado no DOM.");
  if (!createTopicModal) console.warn("Elemento #create-topic-modal não encontrado no DOM.");
  if (!openModalLink) console.warn("Link .create-topic-link não encontrado no DOM.");
  if (!cancelButton) console.warn("Botão .cancel do modal não encontrado no DOM.");

  // Tabs de filtro
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      const filtro = button.dataset.filtro;
      carregarPosts(filtro);
    });
  });

  // Aguardar navbar ser preenchida por menu-drop.js
  function bindHamburgerMenu() {
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".main");
    const navLinks = document.querySelector(".nav_links");

    if (hamburgerMenu && sidebar && main && navLinks) {
      hamburgerMenu.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        main.classList.toggle("sidebar-open");
        navLinks.classList.toggle("open");
        console.log("Menu hambúrguer clicado, toggling sidebar e nav_links:", sidebar.classList.contains("open"));
      });
      console.log("Eventos do menu hambúrguer vinculados com sucesso.");
    } else {
      console.warn("Elementos .hamburger-menu, .sidebar, .main ou .nav_links não encontrados no DOM.");
    }
  }

  bindHamburgerMenu();
  setTimeout(bindHamburgerMenu, 1000);

  // Pesquisa
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.trim();
        const activeFiltro = document.querySelector(".tab-button.active")?.dataset.filtro || "top";
        carregarPosts(activeFiltro, searchTerm);
      }, 300);
    });
  }

  // Modal de criação de tópico
  if (openModalLink) {
    console.log("Vinculando evento ao .create-topic-link");
    openModalLink.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Clique em .create-topic-link detectado");
      openCreateTopicModal();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", closeCreateTopicModal);
  }

  async function carregarPosts(filtro = "top", searchTerm = "") {
    if (!postContainer) return;
    try {
      console.log(`Carregando posts com filtro: ${filtro}, busca: ${searchTerm}`);
      let url = `/api/forum/posts?filtro=${filtro}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const resposta = await fetch(url);
      console.log("Status da resposta:", resposta.status, resposta.statusText);
      if (!resposta.ok) {
        const errorData = await resposta.json().catch(() => ({}));
        console.error("Detalhes do erro:", errorData);
        throw new Error(`Erro HTTP: ${resposta.status} - ${errorData.error || resposta.statusText}`);
      }
      const posts = await resposta.json();
      console.log("Posts recebidos:", posts);

      postContainer.innerHTML = "";
      if (posts.length === 0) {
        postContainer.innerHTML = "<p>Nenhum tópico encontrado.</p>";
        return;
      }

      posts.forEach((post) => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
          <a href="#" class="post-link" data-topico-id="${post.id}" style="text-decoration: none; color: inherit;">
            <div class="post-header">
              <img src="${post.user.avatar || "/Uploads/avatar-padrao.png"}" alt="User" />
              <div>
                <strong>${post.user.nome}</strong>
                <div style="font-size: 12px; color: #888">${new Date(post.time).toLocaleString()}</div>
              </div>
            </div>
            <div class="post-title">${post.titulo}</div>
            <div class="post-content">${post.descricao}</div>
            <div class="post-meta">
              <div class="tags">
                ${post.tags.map((tag) => `<div class="tag">${tag}</div>`).join("")}
              </div>
              <div class="post-footer">
                <i class="fa-regular fa-eye"></i> ${post.views || 0}
                <i class="fa-regular fa-comment"></i> ${post.comments || 0}
                <i class="fa fa-arrow-up"></i> ${post.likes || 0}
              </div>
            </div>
          </a>
        `;
        postContainer.appendChild(card);
      });

      // Vincular eventos aos links dos posts
      const postLinks = postContainer.querySelectorAll(".post-link");
      postLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const topicoId = link.dataset.topicoId;
          console.log("Clique no post-link detectado, topicoId:", topicoId);
          visualizarTopico(topicoId);
        });
      });
    } catch (erro) {
      console.error("Erro ao carregar posts:", erro.message);
      postContainer.innerHTML = `<p>Erro ao carregar posts: ${erro.message}</p>`;
    }
  }

  async function carregarCategorias() {
    const select = document.getElementById("topic-category");
    if (!select) {
      console.warn("Elemento #topic-category não encontrado no DOM.");
      return;
    }
    try {
      console.log("Carregando categorias via GET /api/forum/categorias");
      const response = await fetch("/api/forum/categorias");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const categorias = await response.json();
      console.log("Categorias recebidas:", categorias);
      select.innerHTML = '<option value="">Selecione uma categoria</option>';
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nome;
        select.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar categorias:", error.message);
      alert("Erro ao carregar categorias. Tente novamente.");
    }
  }

  if (createTopicForm) {
    createTopicForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const authRaw = localStorage.getItem("auth");
      let auth;
      try {
        auth = JSON.parse(authRaw);
        console.log("Auth parsed:", auth);
      } catch (parseError) {
        console.error("Erro ao parsear auth:", parseError.message);
        alert("Erro de autenticação. Faça login novamente.");
        window.location.href = "/login.html";
        return;
      }
      if (!auth || !auth.token) {
        console.warn("Usuário não autenticado. Redirecionando para login.");
        alert("Por favor, faça login para criar um tópico.");
        window.location.href = "/login.html";
        return;
      }

      const titleInput = document.getElementById("topic-title");
      const descriptionInput = document.getElementById("topic-description");
      const categoriaSelect = document.getElementById("topic-category");
      const tagsInput = document.getElementById("topic-tags");

      if (!titleInput || !descriptionInput || !categoriaSelect || !tagsInput) {
        console.warn("Um ou mais elementos do formulário de tópico não encontrados no DOM.");
        return;
      }

      const title = titleInput.value.trim();
      const description = descriptionInput.value.trim();
      const categoriaId = categoriaSelect.value;
      const tags = tagsInput
        .value.trim()
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      if (!categoriaId) {
        alert("Por favor, selecione uma categoria.");
        return;
      }

      try {
        console.log("Enviando requisição para POST /api/forum/topicos", {
          titulo: title,
          descricao: description,
          categoria_id: categoriaId,
          tags,
        });
        const response = await fetch("/api/forum/topicos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            titulo: title,
            descricao: description,
            categoria_id: categoriaId,
            tags,
          }),
        });
        console.log("Status da resposta:", response.status, response.statusText);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Detalhes do erro:", errorData);
          throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
        }
        const newTopic = await response.json();
        console.log("Tópico criado:", newTopic);
        closeCreateTopicModal();
        createTopicForm.reset();
        const activeFiltro = document.querySelector(".tab-button.active")?.dataset.filtro || "top";
        carregarPosts(activeFiltro);
      } catch (error) {
        console.error("Erro ao criar tópico:", error.message);
        alert("Erro ao criar tópico: " + error.message);
      }
    });
  }

  function visualizarTopico(topicoId) {
    console.log("Visualizando tópico ID:", topicoId, "Timestamp:", new Date().toISOString());
    const authRaw = localStorage.getItem("auth");
    console.log("Auth raw do localStorage:", authRaw);
    let auth;
    try {
      auth = JSON.parse(authRaw);
      console.log("Auth parsed:", auth);
    } catch (parseError) {
      console.error("Erro ao parsear auth:", parseError.message);
      alert("Erro de autenticação. Faça login novamente.");
      window.location.href = "/login.html";
      return;
    }
    if (!auth || !auth.token) {
      console.warn("Usuário não autenticado. Redirecionando para login.");
      alert("Por favor, faça login para visualizar o tópico.");
      window.location.href = "/login.html";
      return;
    }
    sessionStorage.setItem("currentTopicoId", topicoId);
    console.log("Redirecionando para /post.html com topicoId:", topicoId);
    window.location.href = "/post.html";
  }

  function openCreateTopicModal() {
    console.log("Abrindo modal de criação de tópico");
    if (createTopicModal) {
      carregarCategorias();
      createTopicModal.style.display = "flex";
    } else {
      console.warn("Elemento #create-topic-modal não encontrado no DOM.");
    }
  }

  function closeCreateTopicModal() {
    console.log("Fechando modal de criação de tópico");
    if (createTopicModal) {
      createTopicModal.style.display = "none";
    } else {
      console.warn("Elemento #create-topic-modal não encontrado no DOM.");
    }
  }

  carregarPosts();
});

// // src/front/js/forum-substituto.js
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("Iniciando forum-substituto.js - Timestamp:", new Date().toISOString());

//   const buttons = document.querySelectorAll(".tab-button");
//   const searchInput = document.getElementById("search-input");
//   const postContainer = document.getElementById("post-container");
//   const createTopicForm = document.getElementById("create-topic-form");
//   const createTopicModal = document.getElementById("create-topic-modal");
//   const openModalLink = document.querySelector(".create-topic-link");
//   const cancelButton = document.querySelector(".modal-content .cancel");

//   if (!buttons.length) console.warn("Nenhum elemento .tab-button encontrado no DOM.");
//   if (!searchInput) console.warn("Elemento #search-input não encontrado no DOM.");
//   if (!postContainer) console.warn("Elemento #post-container não encontrado no DOM.");
//   if (!createTopicForm) console.warn("Elemento #create-topic-form não encontrado no DOM.");
//   if (!createTopicModal) console.warn("Elemento #create-topic-modal não encontrado no DOM.");
//   if (!openModalLink) console.warn("Link .create-topic-link não encontrado no DOM.");
//   if (!cancelButton) console.warn("Botão .cancel do modal não encontrado no DOM.");

//   // Tabs de filtro
//   buttons.forEach((button) => {
//     button.addEventListener("click", () => {
//       buttons.forEach((btn) => btn.classList.remove("active"));
//       button.classList.add("active");
//       const filtro = button.dataset.filtro;
//       carregarPosts(filtro);
//     });
//   });

//   // Aguardar navbar ser preenchida por menu-drop.js
//   function bindHamburgerMenu() {
//     const hamburgerMenu = document.querySelector(".hamburger-menu");
//     const sidebar = document.querySelector(".sidebar");
//     const main = document.querySelector(".main");
//     const navLinks = document.querySelector(".nav_links");

//     if (hamburgerMenu && sidebar && main && navLinks) {
//       hamburgerMenu.addEventListener("click", () => {
//         sidebar.classList.toggle("open");
//         main.classList.toggle("sidebar-open");
//         navLinks.classList.toggle("open");
//         console.log("Menu hambúrguer clicado, toggling sidebar e nav_links:", sidebar.classList.contains("open"));
//       });
//       console.log("Eventos do menu hambúrguer vinculados com sucesso.");
//     } else {
//       console.warn("Elementos .hamburger-menu, .sidebar, .main ou .nav_links não encontrados no DOM.");
//     }
//   }

//   // Tentar vincular o menu imediatamente e após um pequeno atraso
//   bindHamburgerMenu();
//   setTimeout(bindHamburgerMenu, 1000); // Aguarda 1s para menu-drop.js carregar

//   // Pesquisa
//   if (searchInput) {
//     let searchTimeout;
//     searchInput.addEventListener("input", () => {
//       clearTimeout(searchTimeout);
//       searchTimeout = setTimeout(() => {
//         const searchTerm = searchInput.value.trim();
//         const activeFiltro = document.querySelector(".tab-button.active")?.dataset.filtro || "top";
//         carregarPosts(activeFiltro, searchTerm);
//       }, 300);
//     });
//   }

//   // Modal de criação de tópico
//   if (openModalLink) {
//     openModalLink.addEventListener("click", (e) => {
//       e.preventDefault();
//       openCreateTopicModal();
//     });
//   }

//   if (cancelButton) {
//     cancelButton.addEventListener("click", closeCreateTopicModal);
//   }

//   async function carregarPosts(filtro = "top", searchTerm = "") {
//     if (!postContainer) return;
//     try {
//       console.log(`Carregando posts com filtro: ${filtro}, busca: ${searchTerm}`);
//       let url = `/api/forum/posts?filtro=${filtro}`;
//       if (searchTerm) {
//         url += `&search=${encodeURIComponent(searchTerm)}`;
//       }
//       const resposta = await fetch(url);
//       console.log("Status da resposta:", resposta.status, resposta.statusText);
//       if (!resposta.ok) {
//         const errorData = await resposta.json().catch(() => ({}));
//         console.error("Detalhes do erro:", errorData);
//         throw new Error(`Erro HTTP: ${resposta.status} - ${errorData.error || resposta.statusText}`);
//       }
//       const posts = await resposta.json();
//       console.log("Posts recebidos:", posts);

//       postContainer.innerHTML = "";
//       if (posts.length === 0) {
//         postContainer.innerHTML = "<p>Nenhum tópico encontrado.</p>";
//         return;
//       }

//       posts.forEach((post) => {
//         const card = document.createElement("div");
//         card.className = "post-card";
//         card.innerHTML = `
//           <a href="#" onclick="visualizarTopico(${post.id}); return false;" style="text-decoration: none; color: inherit;">
//             <div class="post-header">
//               <img src="${post.user.avatar || "/Uploads/avatar-padrao.png"}" alt="User" />
//               <div>
//                 <strong>${post.user.nome}</strong>
//                 <div style="font-size: 12px; color: #888">${new Date(post.time).toLocaleString()}</div>
//               </div>
//             </div>
//             <div class="post-title">${post.titulo}</div>
//             <div class="post-content">${post.descricao}</div>
//             <div class="post-meta">
//               <div class="tags">
//                 ${post.tags.map((tag) => `<div class="tag">${tag}</div>`).join("")}
//               </div>
//               <div class="post-footer">
//                 <i class="fa-regular fa-eye"></i> ${post.views || 0}
//                 <i class="fa-regular fa-comment"></i> ${post.comments || 0}
//                 <i class="fa fa-arrow-up"></i> ${post.likes || 0}
//               </div>
//             </div>
//           </a>
//         `;
//         postContainer.appendChild(card);
//       });
//     } catch (erro) {
//       console.error("Erro ao carregar posts:", erro.message);
//       postContainer.innerHTML = `<p>Erro ao carregar posts: ${erro.message}</p>`;
//     }
//   }

//   async function carregarCategorias() {
//     const select = document.getElementById("topic-category");
//     if (!select) {
//       console.warn("Elemento #topic-category não encontrado no DOM.");
//       return;
//     }
//     try {
//       console.log("Carregando categorias via GET /api/forum/categorias");
//       const response = await fetch("/api/forum/categorias");
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
//       }
//       const categorias = await response.json();
//       console.log("Categorias recebidas:", categorias);
//       select.innerHTML = '<option value="">Selecione uma categoria</option>';
//       categorias.forEach((cat) => {
//         const option = document.createElement("option");
//         option.value = cat.id;
//         option.textContent = cat.nome;
//         select.appendChild(option);
//       });
//     } catch (error) {
//       console.error("Erro ao carregar categorias:", error.message);
//       alert("Erro ao carregar categorias. Tente novamente.");
//     }
//   }

//   if (createTopicForm) {
//     createTopicForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const authRaw = localStorage.getItem("auth");
//       let auth;
//       try {
//         auth = JSON.parse(authRaw);
//         console.log("Auth parsed:", auth);
//       } catch (parseError) {
//         console.error("Erro ao parsear auth:", parseError.message);
//         alert("Erro de autenticação. Faça login novamente.");
//         window.location.href = "/login.html";
//         return;
//       }
//       if (!auth || !auth.token) {
//         console.warn("Usuário não autenticado. Redirecionando para login.");
//         alert("Por favor, faça login para criar um tópico.");
//         window.location.href = "/login.html";
//         return;
//       }

//       const titleInput = document.getElementById("topic-title");
//       const descriptionInput = document.getElementById("topic-description");
//       const categoriaSelect = document.getElementById("topic-category");
//       const tagsInput = document.getElementById("topic-tags");

//       if (!titleInput || !descriptionInput || !categoriaSelect || !tagsInput) {
//         console.warn("Um ou mais elementos do formulário de tópico não encontrados no DOM.");
//         return;
//       }

//       const title = titleInput.value.trim();
//       const description = descriptionInput.value.trim();
//       const categoriaId = categoriaSelect.value;
//       const tags = tagsInput
//         .value.trim()
//         .split(",")
//         .map((tag) => tag.trim())
//         .filter((tag) => tag);

//       if (!categoriaId) {
//         alert("Por favor, selecione uma categoria.");
//         return;
//       }

//       try {
//         console.log("Enviando requisição para POST /api/forum/topicos", {
//           titulo: title,
//           descricao: description,
//           categoria_id: categoriaId,
//           tags,
//         });
//         const response = await fetch("/api/forum/topicos", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${auth.token}`,
//           },
//           body: JSON.stringify({
//             titulo: title,
//             descricao: description,
//             categoria_id: categoriaId,
//             tags,
//           }),
//         });
//         console.log("Status da resposta:", response.status, response.statusText);
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
//           console.error("Detalhes do erro:", errorData);
//           throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
//         }
//         const newTopic = await response.json();
//         console.log("Tópico criado:", newTopic);
//         closeCreateTopicModal();
//         createTopicForm.reset();
//         const activeFiltro = document.querySelector(".tab-button.active")?.dataset.filtro || "top";
//         carregarPosts(activeFiltro);
//       } catch (error) {
//         console.error("Erro ao criar tópico:", error.message);
//         alert("Erro ao criar tópico: " + error.message);
//       }
//     });
//   }

//   function visualizarTopico(topicoId) {
//     console.log("Visualizando tópico ID:", topicoId, "Timestamp:", new Date().toISOString());
//     const authRaw = localStorage.getItem("auth");
//     console.log("Auth raw do localStorage:", authRaw);
//     let auth;
//     try {
//       auth = JSON.parse(authRaw);
//       console.log("Auth parsed:", auth);
//     } catch (parseError) {
//       console.error("Erro ao parsear auth:", parseError.message);
//       alert("Erro de autenticação. Faça login novamente.");
//       window.location.href = "/login.html";
//       return;
//     }
//     if (!auth || !auth.token) {
//       console.warn("Usuário não autenticado. Redirecionando para login.");
//       alert("Por favor, faça login para visualizar o tópico.");
//       window.location.href = "/login.html";
//       return;
//     }
//     sessionStorage.setItem("currentTopicoId", topicoId);
//     console.log("Redirecionando para /post.html com topicoId:", topicoId);
//     window.location.href = "/post.html";
//   }

//   function openCreateTopicModal() {
//     console.log("Abrindo modal de criação de tópico");
//     if (createTopicModal) {
//       carregarCategorias();
//       createTopicModal.style.display = "flex";
//     } else {
//       console.warn("Elemento #create-topic-modal não encontrado no DOM.");
//     }
//   }

//   function closeCreateTopicModal() {
//     console.log("Fechando modal de criação de tópico");
//     if (createTopicModal) {
//       createTopicModal.style.display = "none";
//     } else {
//       console.warn("Elemento #create-topic-modal não encontrado no DOM.");
//     }
//   }

//   carregarPosts();
// });

// // // front/js/forum-substituto.js
// // const buttons = document.querySelectorAll(".tab-button");
// // const searchInput = document.getElementById("search-input");
// // const postContainer = document.getElementById("post-container");

// // buttons.forEach((button) => {
// //   button.addEventListener("click", () => {
// //     buttons.forEach((btn) => btn.classList.remove("active"));
// //     button.classList.add("active");
// //     const filtro = button.dataset.filtro;
// //     carregarPosts(filtro);
// //   });
// // });

// // function visualizarTopico(topicoId) {
// //   console.log("Visualizando tópico ID:", topicoId, "Timestamp:", new Date().toISOString());
// //   const authRaw = localStorage.getItem("auth");
// //   console.log("Auth raw do localStorage:", authRaw);
// //   let auth;
// //   try {
// //     auth = JSON.parse(authRaw);
// //     console.log("Auth parsed:", auth);
// //   } catch (parseError) {
// //     console.error("Erro ao parsear auth:", parseError.message);
// //     alert("Erro de autenticação. Faça login novamente.");
// //     window.location.href = "login.html";
// //     return;
// //   }
// //   if (!auth || !auth.token) {
// //     console.warn("Usuário não autenticado. Redirecionando para login.");
// //     alert("Por favor, faça login para visualizar o tópico.");
// //     window.location.href = "login.html";
// //     return;
// //   }
// //   sessionStorage.setItem("currentTopicoId", topicoId);
// //   console.log("Redirecionando para post.html com topicoId:", topicoId);
// //   window.location.href = "post.html";
// // }

// // document.addEventListener("DOMContentLoaded", () => {
// //   console.log("Iniciando forum-substituto.js - Timestamp:", new Date().toISOString());

// //   // Usar hamburger-menu para controlar sidebar e nav_links
// //   const hamburgerMenu = document.querySelector(".hamburger-menu");
// //   if (hamburgerMenu) {
// //     hamburgerMenu.addEventListener("click", () => {
// //       document.querySelector(".sidebar").classList.toggle("open");
// //       document.querySelector(".main").classList.toggle("sidebar-open");
// //       document.querySelector(".nav_links").classList.toggle("open");
// //     });
// //   }

// //   async function carregarPosts(filtro = "top", searchTerm = "") {
// //     try {
// //       console.log(`Carregando posts com filtro: ${filtro}, busca: ${searchTerm}`);
// //       let url = `http://127.0.0.1:3000/api/posts?filtro=${filtro}`;
// //       if (searchTerm) {
// //         url += `&search=${encodeURIComponent(searchTerm)}`;
// //       }
// //       const resposta = await fetch(url);
// //       console.log("Status da resposta:", resposta.status, resposta.statusText);
// //       if (!resposta.ok) {
// //         const errorData = await resposta.json();
// //         console.log("Detalhes do erro:", errorData);
// //         throw new Error(`Erro HTTP: ${resposta.status} - ${errorData.error || resposta.statusText}`);
// //       }
// //       const posts = await resposta.json();
// //       console.log("Posts recebidos:", posts);

// //       postContainer.innerHTML = "";
// //       if (posts.length === 0) {
// //         postContainer.innerHTML = "<p>Nenhum tópico encontrado.</p>";
// //         return;
// //       }

// //       posts.forEach((post) => {
// //         const card = document.createElement("div");
// //         card.className = "post-card";
// //         card.innerHTML = `
// //           <a href="#" onclick="visualizarTopico(${post.id}); return false;" style="text-decoration: none; color: inherit;">
// //             <div class="post-header">
// //               <img src="${post.user.avatar || "https://i.pravatar.cc/40"}" alt="User" />
// //               <div>
// //                 <strong>${post.user.nome}</strong>
// //                 <div style="font-size: 12px; color: #888">${new Date(post.time).toLocaleString()}</div>
// //               </div>
// //             </div>
// //             <div class="post-title">${post.titulo}</div>
// //             <div class="post-content">${post.descricao}</div>
// //             <div class="post-meta">
// //               <div class="tags">
// //                 ${post.tags.map((tag) => `<div class="tag">${tag}</div>`).join("")}
// //               </div>
// //               <div class="post-footer">
// //                 <i class="fa-regular fa-eye"></i> ${post.views || 0}
// //                 <i class="fa-regular fa-comment"></i> ${post.comments || 0}
// //                 <i class="fa fa-arrow-up"></i> ${post.likes || 0}
// //               </div>
// //             </div>
// //           </a>
// //         `;
// //         postContainer.appendChild(card);
// //       });
// //     } catch (erro) {
// //       console.error("Erro ao carregar posts:", erro.message);
// //       postContainer.innerHTML = `<p>Erro ao carregar posts: ${erro.message}</p>`;
// //     }
// //   }

// //   let searchTimeout;
// //   searchInput.addEventListener("input", () => {
// //     clearTimeout(searchTimeout);
// //     searchTimeout = setTimeout(() => {
// //       const searchTerm = searchInput.value.trim();
// //       const activeFiltro = document.querySelector(".tab-button.active").dataset.filtro;
// //       carregarPosts(activeFiltro, searchTerm);
// //     }, 300);
// //   });

// //   // Carregar categorias para o modal
// //   async function carregarCategorias() {
// //     try {
// //       console.log("Carregando categorias via GET /api/categorias");
// //       const response = await fetch("http://127.0.0.1:3000/api/categorias");
// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
// //       }
// //       const categorias = await response.json();
// //       console.log("Categorias recebidas:", categorias);
// //       const select = document.getElementById("topic-category");
// //       select.innerHTML = '<option value="">Selecione uma categoria</option>';
// //       categorias.forEach((cat) => {
// //         const option = document.createElement("option");
// //         option.value = cat.id;
// //         option.textContent = cat.nome;
// //         select.appendChild(option);
// //       });
// //     } catch (error) {
// //       console.error("Erro ao carregar categorias:", error.message);
// //       alert("Erro ao carregar categorias. Tente novamente.");
// //     }
// //   }

// //   const createTopicForm = document.getElementById("create-topic-form");
// //   createTopicForm.addEventListener("submit", async (e) => {
// //     e.preventDefault();
// //     const authRaw = localStorage.getItem("auth");
// //     let auth;
// //     try {
// //       auth = JSON.parse(authRaw);
// //     } catch (parseError) {
// //       console.error("Erro ao parsear auth:", parseError.message);
// //       alert("Erro de autenticação. Faça login novamente.");
// //       window.location.href = "login.html";
// //       return;
// //     }
// //     if (!auth || !auth.token) {
// //       console.warn("Usuário não autenticado. Redirecionando para login.");
// //       alert("Por favor, faça login para criar um tópico.");
// //       window.location.href = "login.html";
// //       return;
// //     }

// //     const title = document.getElementById("topic-title").value.trim();
// //     const description = document.getElementById("topic-description").value.trim();
// //     const categoriaId = document.getElementById("topic-category").value;
// //     const tags = document
// //       .getElementById("topic-tags")
// //       .value.trim()
// //       .split(",")
// //       .map((tag) => tag.trim())
// //       .filter((tag) => tag);

// //     if (!categoriaId) {
// //       alert("Por favor, selecione uma categoria.");
// //       return;
// //     }

// //     try {
// //       console.log("Enviando requisição para POST /api/topicos", {
// //         titulo: title,
// //         descricao: description,
// //         categoria_id: categoriaId,
// //         tags,
// //       });
// //       const response = await fetch("http://127.0.0.1:3000/api/topicos", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${auth.token}`,
// //         },
// //         body: JSON.stringify({
// //           titulo: title,
// //           descricao: description,
// //           categoria_id: categoriaId,
// //           tags,
// //         }),
// //       });
// //       console.log("Status da resposta:", response.status, response.statusText);
// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         console.log("Detalhes do erro:", errorData);
// //         throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
// //       }
// //       const newTopic = await response.json();
// //       console.log("Tópico criado:", newTopic);
// //       closeCreateTopicModal();
// //       createTopicForm.reset();
// //       const activeFiltro = document.querySelector(".tab-button.active").dataset.filtro;
// //       carregarPosts(activeFiltro);
// //     } catch (error) {
// //       console.error("Erro ao criar tópico:", error.message);
// //       alert("Erro ao criar tópico: " + error.message);
// //     }
// //   });

// //   window.openCreateTopicModal = () => {
// //     console.log("Abrindo modal de criação de tópico");
// //     carregarCategorias();
// //     document.getElementById("create-topic-modal").style.display = "flex";
// //   };

// //   window.closeCreateTopicModal = () => {
// //     console.log("Fechando modal de criação de tópico");
// //     document.getElementById("create-topic-modal").style.display = "none";
// //   };

// //   carregarPosts();
// // });