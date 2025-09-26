document.addEventListener("DOMContentLoaded", async () => {
  console.log("Iniciando forum-substituto.js - Timestamp:", new Date().toISOString());

  const buttons = document.querySelectorAll(".tab-button");
  const searchInput = document.getElementById("search-input");
  const postContainer = document.getElementById("post-container");
  const categorySelect = document.getElementById("category-filter");
  const paginate = document.getElementById("paginate");
  const btnFirst = paginate?.querySelector(".first");
  const btnPrev = paginate?.querySelector(".prev");
  const btnNext = paginate?.querySelector(".next");
  const btnLast = paginate?.querySelector(".last");
  const numbersContainer = paginate?.querySelector(".numbers");

  let currentPage = 1;
  let totalPages = 1;
  let currentFiltro = "top";
  let currentCategoria = null;
  let currentSearchTerm = "";

  function renderPagination() {
    if (!numbersContainer) return;
    numbersContainer.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const num = document.createElement("div");
      num.textContent = i;
      num.classList.add("number");
      if (i === currentPage) num.classList.add("active");
      num.addEventListener("click", () => {
        currentPage = i;
        carregarPosts();
      });
      numbersContainer.appendChild(num);
    }

    if (btnFirst) btnFirst.onclick = () => { currentPage = 1; carregarPosts(); };
    if (btnPrev) btnPrev.onclick = () => { if (currentPage > 1) { currentPage--; carregarPosts(); } };
    if (btnNext) btnNext.onclick = () => { if (currentPage < totalPages) { currentPage++; carregarPosts(); } };
    if (btnLast) btnLast.onclick = () => { currentPage = totalPages; carregarPosts(); };
  }

  async function carregarCategorias() {
    if (!categorySelect) return;
    try {
      const response = await fetch("https://devlab-foa.onrender.com/api/forum/categorias");
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const categorias = await response.json();
      categorySelect.innerHTML = '';
      const optionGeral = document.createElement("option");
      optionGeral.value = "";
      optionGeral.textContent = "Geral";
      categorySelect.appendChild(optionGeral);
      categorias.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nome;
        categorySelect.appendChild(option);
      });
      // Mantém a seleção atual
      categorySelect.value = currentCategoria || "";
    } catch (erro) {
      console.error("Erro ao carregar categorias:", erro.message);
      alert("Erro ao carregar categorias. Tente novamente.");
    }
  }

  async function carregarPosts() {
    if (!postContainer) return;
    postContainer.innerHTML = `<p>Carregando posts...</p>`;
    try {
      let url = `/api/forum/posts?filtro=${currentFiltro}&page=${currentPage}&limit=10`;
      if (currentSearchTerm) url += `&search=${encodeURIComponent(currentSearchTerm)}`;
      if (currentCategoria) url += `&categoria=${currentCategoria}`;
      
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
      const { data, pagination } = await resposta.json();
      
      window.posts = data || [];
      postContainer.innerHTML = "";
      
      if (!window.posts.length) {
        postContainer.innerHTML = "<p>Nenhum tópico encontrado.</p>";
        if (paginate) paginate.style.display = "none";
        return;
      }
      if (paginate) paginate.style.display = "";
      
      totalPages = pagination.totalPages || 1;
      renderPagination();

      window.posts.forEach((post) => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.innerHTML = `
          <a href="#" class="post-link" data-topico-id="${post.id}" style="text-decoration: none; color: inherit;">
            <div class="post-header">
              <img src="${post.user.avatar || "Uploads/avatar-padrao.png"}" alt="User" />
              <div>
                <strong>${post.user.nome}</strong>
                <div style="font-size: 12px; color: #888">${new Date(post.time).toLocaleString()}</div>
              </div>
            </div>
            <div class="post-title">${post.titulo}</div>
            <div class="post-content">${post.descricao}</div>
            <div class="post-meta">
              <div class="tags">${post.tags.map(tag => `<div class="tag">${tag}</div>`).join("")}</div>
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

      const postLinks = postContainer.querySelectorAll(".post-link");
      postLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const topicoId = link.dataset.topicoId;
          visualizarTopico(topicoId);
        });
      });
    } catch (erro) {
      console.error("Erro ao carregar posts:", erro.message);
      postContainer.innerHTML = `<p>Erro ao carregar posts: ${erro.message}</p>`;
    }
  }

  function visualizarTopico(topicoId) {
    const authRaw = localStorage.getItem("auth");
    let auth;
    try {
      auth = JSON.parse(authRaw);
    } catch {
      alert("Erro de autenticação. Faça login novamente.");
      window.location.href = "login.html";
      return;
    }
    if (!auth?.token) {
      alert("Por favor, faça login para visualizar o tópico.");
      window.location.href = "login.html";
      return;
    }
    window.location.href = `post.html?id=${topicoId}`;
  }

  // Listeners de eventos
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFiltro = button.dataset.filtro;
      currentPage = 1;
      carregarPosts();
    });
  });

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      currentCategoria = categorySelect.value || null;
      currentPage = 1;
      carregarPosts();
    });
  }

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearchTerm = searchInput.value.trim();
        currentPage = 1;
        carregarPosts();
      }, 300);
    });
  }

  // Inicialização
  await carregarCategorias();
  carregarPosts();
});