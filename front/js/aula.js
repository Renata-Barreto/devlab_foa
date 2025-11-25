

const API_BASE = "/api";

// auth
const raw = localStorage.getItem("auth");
let auth = null;
try { auth = JSON.parse(raw); } catch { auth = null; }

if (!auth || !auth.token) {
  localStorage.removeItem("auth");
  window.location.href = "/login.html";
}

const aulaId = new URLSearchParams(window.location.search).get("id");

// ELEMENTOS PRINCIPAIS
const titleEl = document.getElementById("lessonTitle");
const subEl = document.getElementById("lessonSub");
const bodyEl = document.getElementById("lessonBody");
const markBtn = document.getElementById("markBtn");
const markStatus = document.getElementById("markStatus");

// TOPBAR
const prevBtn = document.getElementById("btnPrev");
const nextBtn = document.getElementById("btnNext");
const btnVoltar = document.getElementById("btnVoltar");

// TOPO AULA
const topTitle = document.getElementById("topTitle");
const topMeta = document.getElementById("topMeta");

// SIDEBAR
const sidebarEl = document.getElementById("sidebar");
const sidebarLista = document.getElementById("sidebar-modulos");
const cursoNome = document.getElementById("cursoNome");
const toggleBtn = document.getElementById("toggleSidebar");

let sidebarState = 'open'; // 'open' | 'closed'

// inicial
setupSidebarToggle();
carregarAula();


async function carregarAula() {
  try {
    const rAula = await fetch(`${API_BASE}/curso/aula/${aulaId}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });

    if (!rAula.ok) throw new Error("Erro ao buscar aula");
    const aula = await rAula.json();

    let curso = null;
    try {
      const rCurso = await fetch(`${API_BASE}/curso/${aula.curso_id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (rCurso.ok) curso = await rCurso.json();
    } catch {}

    renderAula(aula, curso);
  } catch (e) {
    console.error(e);
    if (titleEl) titleEl.textContent = "Erro ao carregar aula";
    if (bodyEl) bodyEl.innerHTML = "<p>Erro ao conectar no servidor</p>";
  }
}


function renderAula(aula, curso){
  titleEl.textContent = aula.titulo || "Sem título";
  bodyEl.innerHTML = aula.conteudo || "<p>Sem conteúdo</p>";

  try { localStorage.setItem("ultimaAula", aula.aula_id); } catch {}

  if (aula.concluida) {
    markBtn.style.display = "none";
    markStatus.innerHTML = `<span class="badge-done">Concluída</span>`;
  } else {
    markBtn.style.display = "inline-block";
    markBtn.textContent = "Marcar como concluída";
    markBtn.disabled = false;
    markBtn.onclick = () => concluirAula(aula.aula_id);
  }

  renderSidebar(curso, aula.aula_id);
  atualizarProgresso(curso);
  atualizarBotoes(curso, aula);
}


async function concluirAula(id){
  markBtn.disabled = true;
  markBtn.textContent = "Salvando...";

  try {
    const r = await fetch(`${API_BASE}/curso/aula/${id}/concluir`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json"
      }
    });

    if (!r.ok) throw new Error("Erro ao concluir aula");

    carregarAula();
  } catch (e) {
    console.error(e);
    alert("Erro ao concluir a aula");
    markBtn.disabled = false;
    markBtn.textContent = "Marcar como concluída";
  }
}


function renderSidebar(curso, currentId){
  sidebarLista.innerHTML = "";

  if (!curso || !curso.modulos) {
    sidebarLista.innerHTML = "<p>Sem módulos.</p>";
    cursoNome.textContent = curso ? curso.nome : "Curso";
    return;
  }

  cursoNome.textContent = curso.nome || "Curso";

  let global = 0;
  curso.modulos.forEach(mod => {
    (mod.aulas || []).forEach(a => {
      global++;
      a.numeroGlobal = global;
    });
  });

  curso.modulos.forEach(mod => {
    const mDiv = document.createElement("div");
    mDiv.className = "module-block";

    mDiv.innerHTML = `
      <div class="module-header">
        <strong>${mod.nome}</strong>
        <small>${(mod.aulas||[]).length} aulas</small>
      </div>
    `;

    const list = document.createElement("div");
    list.className = "lessons-list";

    (mod.aulas || []).forEach(a => {
      const el = document.createElement("div");
      el.className = "sidebar-aula";

      if (String(a.id) === String(currentId)) el.classList.add("atual");
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
              ? `<button class="open-aula" data-id="${a.id}">Ir</button>`
              : `<span class="tooltip" data-tip="Conclua a anterior"><i class='fa-solid fa-lock'></i></span>`
          }
        </div>
      `;

      if (a.liberada) {
        const btn = el.querySelector(".open-aula");
        if (btn) btn.addEventListener("click", () => {
          localStorage.setItem("ultimaAula", a.id);
          window.location.href = `/aula.html?id=${a.id}`;
        });
      }

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
  const index = lista.findIndex(a => a.id == aulaAtual.id);
  const proximaAula = lista[index + 1];

  
  if (index <= 0) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
    prevBtn.onclick = () => window.location.href = `/aula.html?id=${lista[index - 1].id}`;
  }

  // proxima
  if (!aulaAtual.concluida) {
    nextBtn.disabled = true;
  } else if (proximaAula) {
    nextBtn.disabled = false;
    nextBtn.onclick = () => window.location.href = `/aula.html?id=${proximaAula.id}`;
  } else {
    nextBtn.disabled = true;
  }
}

if (btnVoltar) btnVoltar.onclick = () => history.back();


function atualizarProgresso(curso) {
  if (!curso || !curso.modulos) return;

  const pct = Number(curso.progresso) || 0;
  let total = 0;
  let concluidas = 0;

  curso.modulos.forEach(mod => {
    (mod.aulas || []).forEach(a => {
      total++;
      if (a.status === "concluida") concluidas++;
    });
  });

  const txt = document.querySelector(".progress-text");
  if (txt) txt.textContent = `${concluidas}/${total} aulas — ${pct}%`;

  const bar = document.querySelector(".progress-bar");
  if (bar) bar.style.width = pct + "%";
}

function setupSidebarToggle() {
  if (!toggleBtn || !sidebarEl) return;


  sidebarEl.classList.remove('closed');
  sidebarEl.classList.add('open');

  toggleBtn.addEventListener('click', () => {
    const isClosed = sidebarEl.classList.contains('closed');

    if (isClosed) {
      sidebarEl.classList.remove('closed');
      sidebarEl.classList.add('open');
      
    } else {
      sidebarEl.classList.remove('open');
      sidebarEl.classList.add('closed');
    }
   
    toggleBtn.setAttribute('aria-expanded', String(!isClosed));
  });

  
  document.addEventListener('click', (ev) => {
    const target = ev.target;
    const isMobile = window.matchMedia('(max-width:1000px)').matches;
    if (!isMobile) return; 
    if (!sidebarEl.classList.contains('open')) return;
    
    if (!sidebarEl.contains(target) && target !== toggleBtn) {
      sidebarEl.classList.remove('open');
      sidebarEl.classList.add('closed');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}
