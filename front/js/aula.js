const API_BASE = "https://devlab-foa.onrender.com/api";

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

// ELEMENTOS DA TOPBAR
const prevBtn = document.getElementById("btnPrev");
const nextBtn = document.getElementById("btnNext");
const btnVoltar = document.getElementById("btnVoltar");

const topTitle = document.getElementById("topTitle");
const topMeta = document.getElementById("topMeta");

// SIDEBAR
const sidebarEl = document.getElementById("sidebar");
const sidebarLista = document.getElementById("sidebar-modulos");

carregarAula();

/* ============================================================
   BUSCAR AULA
   ============================================================ */
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
        titleEl.textContent = "Erro ao carregar aula";
        bodyEl.innerHTML = "<p>Erro ao conectar no servidor</p>";
    }
}

/* ============================================================
   RENDER AULA + SIDEBAR + NAVEGAÇÃO
   ============================================================ */
function renderAula(aula, curso){
    // Conteúdo da aula
    titleEl.textContent = aula.titulo || "Sem título";
    subEl.textContent = aula.nome_modulo || "";
    bodyEl.innerHTML = aula.conteudo || "<p>Sem conteúdo</p>";

    topTitle.textContent = aula.titulo;
    topMeta.textContent = `${aula.nome_modulo} — ${aula.nome_curso}`;

    try { localStorage.setItem("ultimaAula", aula.aula_id); } catch {}

    // Status de conclusão
    if (aula.concluida) {
        markBtn.style.display = "none";
        markStatus.innerHTML = `<span class="badge-done">Concluída ✔</span>`;
    } else {
        markBtn.style.display = "inline-block";
        markBtn.textContent = "Concluir Aula";
        markBtn.disabled = false;
        markBtn.onclick = () => concluirAula(aula.aula_id);
    }

    // Sidebar + Progresso
    renderSidebar(curso, aula.aula_id);
    atualizarProgresso(curso);

    // Botões de navegação
    atualizarBotoes(curso, aula);
}

/* ============================================================
   CONCLUIR AULA
   ============================================================ */
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
        markBtn.textContent = "Concluir Aula";
    }
}

/* ============================================================
   SIDEBAR
   ============================================================ */
function renderSidebar(curso, currentId){
    sidebarLista.innerHTML = "";

    if (!curso || !curso.modulos) {
        sidebarLista.innerHTML = "<p>Sem módulos.</p>";
        return;
    }

    let global = 0;
    curso.modulos.forEach(mod => {
        (mod.aulas || []).forEach(a => {
            global++;
            a.numeroGlobal = global;
        });
    });

    curso.modulos.forEach(mod => {
        const mDiv = document.createElement("div");
        mDiv.className = "sidebar-modulo";

        const todas = mod.aulas.every(a => a.status === "concluida");
        const alguma = mod.aulas.some(a => a.status === "concluida");

        const estado = todas ? "concluido" : alguma ? "aberto" : "fechado";

        let icone =
            estado === "concluido" ? "✔"
          : estado === "aberto" ? "○"
          : "🔒";

        mDiv.innerHTML = `
            <div class="sidebar-modulo-head">
                <span class="sidebar-icon">${icone}</span>
                <span>${mod.nome}</span>
            </div>
        `;

        const lista = document.createElement("div");
        lista.className = "sidebar-lessons";

        mod.aulas.forEach(a => {
            const el = document.createElement("div");
            el.className = "sidebar-aula";

            if (String(a.id) === String(currentId)) el.classList.add("atual");

            if (!a.liberada && a.status !== "concluida") {
                el.classList.add("locked");
            }

            el.innerHTML = `
                <div class="sidebar-aula-left">
                    <span class="num">${a.numeroGlobal}</span>
                    <span class="titulo">${a.titulo}</span>
                </div>
                <div class="sidebar-aula-right">
                    ${
                        a.status === "concluida"
                            ? "<span class='badge-done'>✔</span>"
                            : a.liberada
                            ? `<button class="open-aula" data-id="${a.id}">Ir</button>`
                            : `<span class="tooltip">🔒</span>`
                    }
                </div>
            `;

            if (a.liberada) {
                el.querySelector(".open-aula").addEventListener("click", () => {
                    localStorage.setItem("ultimaAula", a.id);
                    window.location.href = `/aula.html?id=${a.id}`;
                });
            }

            lista.appendChild(el);
        });

        mDiv.appendChild(lista);
        sidebarLista.appendChild(mDiv);
    });
}

/* ============================================================
   BOTOES PREV / NEXT
   ============================================================ */
function atualizarBotoes(curso, aulaAtual) {

    const lista = [];
    curso.modulos.forEach(m => m.aulas.forEach(a => lista.push(a)));

    const index = lista.findIndex(a => a.id == aulaAtual.id);
    const proximaAula = lista[index + 1];

    // Botão anterior
    if (index <= 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
        prevBtn.onclick = () => {
            window.location.href = `/aula.html?id=${lista[index - 1].id}`;
        };
    }

    // Botão próximo
    if (!aulaAtual.concluida) {
        nextBtn.disabled = true;
    } else if (proximaAula) {
        nextBtn.disabled = false;
        nextBtn.onclick = () => {
            window.location.href = `/aula.html?id=${proximaAula.id}`;
        };
    } else {
        nextBtn.disabled = true;
    }
}

/* ============================================================
   VOLTAR
   ============================================================ */
btnVoltar.onclick = () => history.back();

/* ============================================================
   PROGRESSO
   ============================================================ */
function atualizarProgresso(curso) {
    if (!curso || !curso.modulos) return;

    const pct = Number(curso.progresso) || 0;

    let total = 0;
    let concluidas = 0;

    curso.modulos.forEach(mod => {
        mod.aulas.forEach(a => {
            total++;
            if (a.status === "concluida") concluidas++;
        });
    });

    const txt = document.querySelector(".progress-text");
    if (txt) txt.textContent = `${concluidas}/${total} aulas — ${pct}%`;

    const bar = document.querySelector(".progress-bar");
    if (bar) bar.style.width = pct + "%";
}
