const API_BASE = "/api";

// auth
let auth = null;
try { auth = JSON.parse(localStorage.getItem("auth")); } catch {}
if (!auth || !auth.token) {
  localStorage.removeItem("auth");
  window.location.href = "/login.html";
}

const aulaId = new URLSearchParams(window.location.search).get("id");

// ELEMENTOS
const titleEl = document.getElementById("lessonTitle");
const bodyEl = document.getElementById("lessonBody");
const markBtn = document.getElementById("markBtn");
const markStatus = document.getElementById("markStatus");

const prevBtn = document.getElementById("btnPrev");
const nextBtn = document.getElementById("btnNext");
const btnVoltar = document.getElementById("btnVoltar");

const sidebarEl = document.getElementById("sidebar");
const sidebarLista = document.getElementById("sidebar-modulos");
const cursoNome = document.getElementById("cursoNome");
const toggleBtn = document.getElementById("toggleSidebar");

// Inicial
setupSidebarToggle();
carregarAula();

// ======================
//  CARREGAR AULA
// ======================
async function carregarAula() {
  try {
    const rAula = await fetch(`${API_BASE}/curso/aula/${aulaId}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (!rAula.ok) throw new Error("Erro ao buscar aula");
    const aula = await rAula.json();

    const rCurso = await fetch(`${API_BASE}/curso/${aula.curso_id}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    const curso = rCurso.ok ? await rCurso.json() : null;

    renderAula(aula, curso);

  } catch (e) {
    console.error(e);
    titleEl.textContent = "Erro ao carregar aula";
    bodyEl.innerHTML = "<p>Erro ao conectar no servidor</p>";
  }
}

// ======================
//  RENDER PRINCIPAL
// ======================
function renderAula(aula, curso) {
  titleEl.textContent = aula.titulo || "Sem título";
  bodyEl.innerHTML = aula.conteudo || "<p>Sem conteúdo</p>";

  localStorage.setItem("ultimaAula", aula.aula_id);

  if (aula.concluida) {
    markBtn.style.display = "none";
    markStatus.innerHTML = `<span class="badge-done">Concluída</span>`;
  } else {
    markBtn.style.display = "inline-block";
    markBtn.textContent = "Concluir Aula";
    markBtn.disabled = false;
    markBtn.onclick = () => concluirAula(aula, curso);
  }

  renderSidebar(curso, aula.aula_id);
  atualizarProgresso(curso);
  atualizarBotoes(curso, aula);
}

// ======================
//  MARCAR COMO CONCLUÍDA
// ======================
async function concluirAula(aulaAtual, curso) {
  markBtn.disabled = true;
  markBtn.textContent = "Salvando...";

  try {
    const r = await fetch(`${API_BASE}/curso/aula/${aulaAtual.aula_id}/concluir`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json"
      }
    });

    if (!r.ok) throw new Error("Erro ao concluir aula");

    aulaAtual.concluida = true;
    markBtn.style.display = "none";
    markStatus.innerHTML = `<span class="badge-done">Concluída</span>`;

    atualizarBotoes(curso, aulaAtual);
    atualizarProgresso(curso);

  } catch (e) {
    console.error(e);
    alert("Erro ao concluir a aula");
    markBtn.disabled = false;
    markBtn.textContent = "Concluir Aula";
  }
}


function renderSidebar(curso, currentId) {
  sidebarLista.innerHTML = "";

  if (!curso || !curso.modulos) {
    sidebarLista.innerHTML = "<p>Sem módulos.</p>";
    cursoNome.textContent = curso ? curso.nome : "Curso";
    return;
  }

  cursoNome.textContent = curso.nome;

  let global = 0;
  curso.modulos.forEach(mod => (mod.aulas || []).forEach(a => a.numeroGlobal = ++global));

  curso.modulos.forEach(mod => {
    const mDiv = document.createElement("div");
    mDiv.className = "module-block";

    mDiv.innerHTML = `
      <div class="module-header">
        <strong>${mod.nome}</strong>
        <small>${(mod.aulas || []).length} aulas</small>
      </div>
    `;

    const list = document.createElement("div");
    list.className = "lessons-list";

    (mod.aulas || []).forEach(a => {
      const el = document.createElement("a");
      el.className = "sidebar-aula";
      el.href = a.liberada || a.status === "concluida"
        ? `/aula.html?id=${a.aula_id}`
        : "javascript:void(0)";

      if (String(a.aula_id) === String(currentId)) el.classList.add("atual");
      if (!a.liberada && a.status !== "concluida") el.classList.add("locked");

      el.innerHTML = `
        <div class="sidebar-aula-left">
          <span class="num">${a.numeroGlobal}</span>
          <div class="titulo">${a.titulo}</div>
        </div>

        <div class="sidebar-aula-right">
          ${
            a.status === "concluida"
              ? "<span class='badge-done'>✔</span>"
              : a.liberada
              ? ""
              : "<i class='fa-solid fa-lock'></i>"
          }
        </div>
      `;

      list.appendChild(el);
    });

    mDiv.appendChild(list);
    sidebarLista.appendChild(mDiv);
  });
}


function atualizarBotoes(curso, aulaAtual) {
  if (!curso) return;

  const lista = [];
  curso.modulos.forEach(m => m.aulas.forEach(a => lista.push(a)));

  const index = lista.findIndex(a => String(a.aula_id) === String(aulaAtual.aula_id));
  const proximaAula = lista[index + 1];

  // Anterior
  prevBtn.disabled = index <= 0;
  if (!prevBtn.disabled)
    prevBtn.onclick = () => window.location.href = `/aula.html?id=${lista[index - 1].aula_id}`;

  // Próxima
  nextBtn.disabled = !aulaAtual.concluida || !proximaAula;

  if (!nextBtn.disabled)
    nextBtn.onclick = () => window.location.href = `/aula.html?id=${proximaAula.aula_id}`;

  // Aplicar estilo visual de botão desabilitado
  nextBtn.classList.toggle("disabled", nextBtn.disabled);
  prevBtn.classList.toggle("disabled", prevBtn.disabled);
}

// ======================
//  PROGRESSO
// ======================
function atualizarProgresso(curso) {
  if (!curso || !curso.modulos) return;

  let total = 0, concluidas = 0;

  curso.modulos.forEach(mod => (mod.aulas || []).forEach(a => {
    total++;
    if (a.status === "concluida") concluidas++;
  }));

  const txt = document.querySelector(".progress-text");
  if (txt) txt.textContent = `${concluidas}/${total} aulas — ${Number(curso.progresso) || 0}%`;

  const bar = document.querySelector(".progress-bar");
  if (bar) bar.style.width = `${Number(curso.progresso) || 0}%`;
}

// ======================
//  SIDEBAR MOBILE
// ======================
function setupSidebarToggle() {
  if (!toggleBtn || !sidebarEl) return;

  sidebarEl.classList.add('open');

  toggleBtn.addEventListener('click', () => {
    const isClosed = sidebarEl.classList.contains('closed');
    sidebarEl.classList.toggle('open', isClosed);
    sidebarEl.classList.toggle('closed', !isClosed);
  });

  document.addEventListener('click', ev => {
    const isMobile = window.matchMedia('(max-width:1000px)').matches;
    if (!isMobile || !sidebarEl.classList.contains('open')) return;

    if (!sidebarEl.contains(ev.target) && ev.target !== toggleBtn) {
      sidebarEl.classList.remove('open');
      sidebarEl.classList.add('closed');
    }
  });
}

if (btnVoltar) btnVoltar.onclick = () => history.back();
