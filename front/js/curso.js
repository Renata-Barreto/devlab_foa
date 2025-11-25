// app.curso.js
const API_BASE = "/api";
const authRaw = localStorage.getItem("auth");
let auth;
try {
  auth = JSON.parse(authRaw);
} catch (e) {
  auth = null;
}

const cursoId = new URLSearchParams(window.location.search).get("id");
const cursoHeader = document.getElementById("curso-header-info");
const descricaoEl = document.getElementById("descricao-curso");
const listaModulos = document.getElementById("lista-modulos");
const voltarParei = document.getElementById("voltarParei");

if (!auth || !auth.token) {
  // usuário não logado — redireciona para login
  console.warn("Token não encontrado, redirecionando ao login...");
  localStorage.removeItem("auth");
  setTimeout(() => (window.location.href = "/login.html"), 600);
} else {
  carregarCurso();
}

voltarParei?.addEventListener("click", (e) => {
  e.preventDefault();
  const ultima = localStorage.getItem("ultimaAula");
  if (ultima) window.location.href = `/aula.html?id=${ultima}`;
  else alert("Nenhuma aula encontrada no histórico.");
});

async function carregarCurso() {
  renderSkeleton();
  try {
    const res = await fetch(`${API_BASE}/curso/${cursoId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    if (!res.ok) {
      throw new Error(`Erro ao buscar curso: ${res.status}`);
    }
    const curso = await res.json();
    renderHeader(curso);
    renderModulos(curso.modulos || []);
  } catch (err) {
    console.error(err);
    descricaoEl.innerHTML = `<p>Erro ao carregar o curso.</p>`;
    listaModulos.innerHTML = `<div style="color:#c00">Não foi possível obter os módulos.</div>`;
  }
}

function renderSkeleton() {
  listaModulos.innerHTML = "";
  for (let i = 0; i < 2; i++) {
    const m = document.createElement("div");
    m.className = "modulo";
    m.innerHTML = `<div style="width:100%"><div class="skeleton-row" style="width:35%"></div><div class="skeleton-row" style="width:60%;margin-top:12px"></div></div>`;
    listaModulos.appendChild(m);
  }
}

function renderHeader(curso) {
  // mantive classes originais, só atualizei conteúdo
  cursoHeader.innerHTML = `
    <img src="imagens/logo-js.png" class="curso-logo">
    <div>
      <p class="curso-subtitulo">curso de</p>
      <h1 class="curso-titulo">${curso.nome}</h1>
      <div class="progress-bar"><div class="progress" style="width:${
        Number(curso.progresso) || 0
      }%"></div></div>
      <span class="progress-text">${
        Number(curso.progresso) || 0
      }% completo</span>
    </div>
  `;
  descricaoEl.innerHTML = `<p>${curso.descricao || ""}</p>`;
}

function renderModulos(modulos) {
  listaModulos.innerHTML = "";
  if (!modulos || modulos.length === 0) {
    listaModulos.innerHTML = "<div>Nenhum módulo encontrado.</div>";
    return;
  }

  modulos.forEach((mod, mi) => {
    const aulas = mod.aulas || [];

    const todasConcluidas = aulas.every((a) => a.status === "concluida");
    const algumaConcluida = aulas.some((a) => a.status === "concluida");

    let estado = "";

    if (todasConcluidas) estado = "concluido";
    else if (algumaConcluida) estado = "aberto";
    else estado = "fechado";

    let icone = "";
    if (estado === "concluido") icone = "✔";
    else if (estado === "aberto") icone = "○";
    else icone = "<i class='fa-solid fa-lock'></i>";

    const mDiv = document.createElement("div");
    mDiv.className =
      "modulo " +
      (estado === "concluido"
        ? "completo"
        : estado === "aberto"
        ? "aberto"
        : "bloqueado");

    mDiv.innerHTML = `
      <div class="module-inner">
        <div class="module-head">
          <div style="display:flex;gap:12px;align-items:center">
            <div class="icone"><i>${icone}
</i></div>
            <div>
              <h3>${mod.nome}</h3>
              <p>${mod.aulas?.length || 0} aulas</p>
            </div>
          </div>

          <div>
            <button class="collapse-toggle btn-small" data-open="true">Ver aulas ▾</button>
          </div>
        </div>

        <div class="lessons-list" style="display:none"></div>
      </div>
    `;
    const lessonsList = mDiv.querySelector(".lessons-list");
    const toggleBtn = mDiv.querySelector(".collapse-toggle");

    // montar aulas
    (mod.aulas || []).forEach((a, ai) => {
      const la = document.createElement("div");
      la.className =
        "lesson-entry " + (a.status === "concluida" ? "active" : "");
      if (!a.liberada && a.status !== "concluida") la.classList.add("locked");

      la.innerHTML = `
        <div class="idx">${ai + 1}</div>
        <div style="flex:1">
          <div style="display:flex;gap:8px;align-items:center">
            <strong style="font-size:14px">${a.titulo}</strong>
            <small style="color:#777">• Aula ${a.numeroGlobal}</small>
            ${
              a.status === "concluida"
                ? '<span class="badge-done" style="margin-left:8px">Concluída</span>'
                : ""
            }
          </div>
          <div style="font-size:13px;color:#777">${a.subtitulo || ""}</div>
        </div>
        <div style="margin-left:8px">
          ${
            a.liberada
              ? `<button class="btn-small open-aula" data-id="${a.aula_id}">Abrir</button>`
              : `<span class="tooltip" data-tip="Conclua a aula anterior para liberar"><i class='fa-solid fa-lock'></i></span>`
          }
        </div>
      `;
      // clique em aula liberada
      if (a.liberada) {
        la.querySelector(".open-aula").addEventListener("click", () => {
          // salva última aula e abre
          localStorage.setItem("ultimaAula", a.aula_id);
          window.location.href = `/aula.html?id=${a.aula_id}`;
        });
      } else {
       
      }

      lessonsList.appendChild(la);
    });

    // toggle collapse
    toggleBtn.addEventListener("click", () => {
      const open = lessonsList.style.display !== "none";
      lessonsList.style.display = open ? "none" : "flex";
      toggleBtn.textContent = open ? "Ver aulas ▾" : "Ocultar aulas ▴";
    });

    listaModulos.appendChild(mDiv);
  });
}
