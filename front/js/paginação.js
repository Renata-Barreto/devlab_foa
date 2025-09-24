document.addEventListener("DOMContentLoaded", () => {
  const postContainer = document.getElementById("post-container");
  const controls = document.querySelector("#paginate .controls");
  const btnFirst = controls.querySelector(".first");
  const btnPrev = controls.querySelector(".prev");
  const btnNext = controls.querySelector(".next");
  const btnLast = controls.querySelector(".last");
  const numbersContainer = controls.querySelector(".numbers");

  let posts = [];
  let currentPage = 1;
  const perPage = 5;
  let totalPages = 1;

  function updatePosts() {
    posts = Array.from(postContainer.children);
    totalPages = Math.ceil(posts.length / perPage);
    renderPage(currentPage);
  }

  function renderPage(page) {
    currentPage = page;
    posts.forEach((post, index) => {
      post.style.display =
        index >= (page - 1) * perPage && index < page * perPage
          ? "block"
          : "none";
    });
    renderNumbers();
  }

  function renderNumbers() {
    numbersContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const num = document.createElement("div");
      num.textContent = i;
      num.classList.add("number");
      if (i === currentPage) num.classList.add("active");
      num.addEventListener("click", () => renderPage(i));
      numbersContainer.appendChild(num);
    }
  }

  // Botões principais
  btnFirst.addEventListener("click", () => renderPage(1));
  btnPrev.addEventListener("click", () => {
    if (currentPage > 1) renderPage(currentPage - 1);
  });
  btnNext.addEventListener("click", () => {
    if (currentPage < totalPages) renderPage(currentPage + 1);
  });
  btnLast.addEventListener("click", () => renderPage(totalPages));

  // Executa quando os posts forem carregados pelo outro script
  const observer = new MutationObserver(() => {
    updatePosts();
  });

  observer.observe(postContainer, { childList: true });

  // Caso já tenham posts no carregamento
  updatePosts();
});
