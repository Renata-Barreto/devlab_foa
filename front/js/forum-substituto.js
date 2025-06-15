// front/js/forum-substituto.js
const buttons = document.querySelectorAll(".tab-button");
const searchInput = document.getElementById("search-input");
const postContainer = document.getElementById("post-container");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    buttons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    const filtro = button.dataset.filtro;
    carregarPosts(filtro);
  });
});

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
    window.location.href = "login.html";
    return;
  }
  if (!auth || !auth.token) {
    console.warn("Usuário não autenticado. Redirecionando para login.");
    alert("Por favor, faça login para visualizar o tópico.");
    window.location.href = "login.html";
    return;
  }
  sessionStorage.setItem("currentTopicoId", topicoId);
  console.log("Redirecionando para post.html com topicoId:", topicoId);
  window.location.href = "post.html";
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Iniciando forum-substituto.js - Timestamp:", new Date().toISOString());

  // Usar hamburger-menu para controlar sidebar e nav_links
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", () => {
      document.querySelector(".sidebar").classList.toggle("open");
      document.querySelector(".main").classList.toggle("sidebar-open");
      document.querySelector(".nav_links").classList.toggle("open");
    });
  }

  async function carregarPosts(filtro = "top", searchTerm = "") {
    try {
      console.log(`Carregando posts com filtro: ${filtro}, busca: ${searchTerm}`);
      let url = `http://127.0.0.1:3000/api/posts?filtro=${filtro}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const resposta = await fetch(url);
      console.log("Status da resposta:", resposta.status, resposta.statusText);
      if (!resposta.ok) {
        const errorData = await resposta.json();
        console.log("Detalhes do erro:", errorData);
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
          <a href="#" onclick="visualizarTopico(${post.id}); return false;" style="text-decoration: none; color: inherit;">
            <div class="post-header">
              <img src="${post.user.avatar || "https://i.pravatar.cc/40"}" alt="User" />
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
    } catch (erro) {
      console.error("Erro ao carregar posts:", erro.message);
      postContainer.innerHTML = `<p>Erro ao carregar posts: ${erro.message}</p>`;
    }
  }

  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = searchInput.value.trim();
      const activeFiltro = document.querySelector(".tab-button.active").dataset.filtro;
      carregarPosts(activeFiltro, searchTerm);
    }, 300);
  });

  // Carregar categorias para o modal
  async function carregarCategorias() {
    try {
      console.log("Carregando categorias via GET /api/categorias");
      const response = await fetch("http://127.0.0.1:3000/api/categorias");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const categorias = await response.json();
      console.log("Categorias recebidas:", categorias);
      const select = document.getElementById("topic-category");
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

  const createTopicForm = document.getElementById("create-topic-form");
  createTopicForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const authRaw = localStorage.getItem("auth");
    let auth;
    try {
      auth = JSON.parse(authRaw);
    } catch (parseError) {
      console.error("Erro ao parsear auth:", parseError.message);
      alert("Erro de autenticação. Faça login novamente.");
      window.location.href = "login.html";
      return;
    }
    if (!auth || !auth.token) {
      console.warn("Usuário não autenticado. Redirecionando para login.");
      alert("Por favor, faça login para criar um tópico.");
      window.location.href = "login.html";
      return;
    }

    const title = document.getElementById("topic-title").value.trim();
    const description = document.getElementById("topic-description").value.trim();
    const categoriaId = document.getElementById("topic-category").value;
    const tags = document
      .getElementById("topic-tags")
      .value.trim()
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    if (!categoriaId) {
      alert("Por favor, selecione uma categoria.");
      return;
    }

    try {
      console.log("Enviando requisição para POST /api/topicos", {
        titulo: title,
        descricao: description,
        categoria_id: categoriaId,
        tags,
      });
      const response = await fetch("http://127.0.0.1:3000/api/topicos", {
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
        const errorData = await response.json();
        console.log("Detalhes do erro:", errorData);
        throw new Error(`Erro HTTP: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const newTopic = await response.json();
      console.log("Tópico criado:", newTopic);
      closeCreateTopicModal();
      createTopicForm.reset();
      const activeFiltro = document.querySelector(".tab-button.active").dataset.filtro;
      carregarPosts(activeFiltro);
    } catch (error) {
      console.error("Erro ao criar tópico:", error.message);
      alert("Erro ao criar tópico: " + error.message);
    }
  });

  window.openCreateTopicModal = () => {
    console.log("Abrindo modal de criação de tópico");
    carregarCategorias();
    document.getElementById("create-topic-modal").style.display = "flex";
  };

  window.closeCreateTopicModal = () => {
    console.log("Fechando modal de criação de tópico");
    document.getElementById("create-topic-modal").style.display = "none";
  };

  carregarPosts();
});