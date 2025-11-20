/* ============================================================
   APP.AULA.JS — UNIFICADO
   (conteúdo da aula + sidebar + prev/next + hover)
   ============================================================ */

const API_BASE = "https://devlab-foa.onrender.com/api";

const raw = localStorage.getItem("auth");
let auth = null;
try { auth = JSON.parse(raw); } catch { auth = null; }

if (!auth || !auth.token) {
    localStorage.removeItem("auth");
    window.location.href = "/login.html";
}

const aulaId = new URLSearchParams(window.location.search).get("id");

// ELEMENTOS
const titleEl = document.getElementById("lessonTitle");
const subEl = document.getElementById("lessonSub");
const bodyEl = document.getElementById("lessonBody");
const modulesListEl = document.getElementById("modulesList");
const markBtn = document.getElementById("markBtn");
const markStatus = document.getElementById("markStatus");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const topTitle = document.getElementById("topTitle");
const topMeta = document.getElementById("topMeta");
const sidebarEl = document.getElementById("sidebar");
const sidebarLista = document.getElementById("sidebar-modulos");

carregarAula();

/* ============================================================
   BUSCAR AULA
   ============================================================ */
async function carregarAula() {
    renderSkeleton();

    try {
        // Aula atual
        const rAula = await fetch(`${API_BASE}/curso/aula/${aulaId}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        });

        if (!rAula.ok) throw new Error("Erro ao buscar aula");
        const aula = await rAula.json();

        // Estrutura do curso
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
        modulesListEl.innerHTML = "<div>Erro ao carregar módulos</div>";
    }
}

/* ============================================================
   SKELETON
   ============================================================ */
function renderSkeleton(){
    titleEl.textContent = "Carregando...";
    bodyEl.innerHTML = `
        <div class="skeleton" style="height:18px;width:70%"></div>
        <div class="skeleton" style="height:14px;width:80%;margin-top:8px"></div>
    `;
    modulesListEl.innerHTML = `
        <div class="skeleton" style="height:18px;width:120px;margin-bottom:12px"></div>
        <div class="skeleton" style="height:14px;width:180px;margin-bottom:8px"></div>
    `;
}

/* ============================================================
   RENDER AULA + SIDEBAR + PREV/NEXT
   ============================================================ */
function renderAula(aula, curso){
    // Conteúdo da aula
    titleEl.textContent = aula.titulo || "Sem título";
    subEl.textContent = aula.nome_modulo || "";
    bodyEl.innerHTML = aula.conteudo || "<p>Sem conteúdo</p>";

    topTitle.textContent = aula.titulo;
    topMeta.textContent = `${aula.nome_modulo} — ${aula.nome_curso}`;

    try { localStorage.setItem("ultimaAula", aula.aula_id); } catch {}

    // Botão concluído
    if (aula.concluida) {
        markBtn.style.display = "none";
        markStatus.innerHTML = `<span class="badge-done">Concluída</span>`;
    } else {
        markBtn.style.display = "inline-block";
        markBtn.textContent = "Marcar como concluída";
        markBtn.disabled = false;
        markBtn.onclick = () => concluirAula(aula.aula_id);
    }

    // Sidebar unificada (design + lógica igual ao curso)
    renderSidebar(curso, aula.aula_id);

    // PREV / NEXT
    setupPrevNext(curso, aula.aula_id);
}

/* ============================================================
   BOTÃO CONCLUIR
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
        markBtn.textContent = "Marcar como concluída";
    }
}

/* ============================================================
   SIDEBAR (VERSÃO FINAL — ÚNICA)
   ============================================================ */
function renderSidebar(curso, currentId){
    sidebarLista.innerHTML = "";

    if (!curso || !curso.modulos) {
        sidebarLista.innerHTML = "<p>Sem módulos.</p>";
        return;
    }

    // NUMERO GLOBAL
    let global = 0;
    curso.modulos.forEach(mod => {
        (mod.aulas || []).forEach(a => {
            global++;
            a.numeroGlobal = global;
        });
    });

    // Renderizar módulos
    curso.modulos.forEach(mod => {
        const mDiv = document.createElement("div");
        mDiv.className = "sidebar-modulo";

        // estado do módulo
        const todas = mod.aulas.every(a => a.status === "concluida");
        const alguma = mod.aulas.some(a => a.status === "concluida");

        const estado = todas ? "concluido" : alguma ? "aberto" : "fechado";

        let icone = estado === "concluido"
            ? "✔"
            : estado === "aberto"
            ? "○"
            : "<i class='fa-solid fa-lock'></i>";

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
                            : `<span class="tooltip" data-tip="Conclua a anterior">🔒</span>`
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
   PREV / NEXT
   ============================================================ */
function setupPrevNext(curso, currentId){
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";

    if (!curso || !curso.modulos) return;

    const flat = [];
    curso.modulos.forEach(m => (m.aulas || []).forEach(a => flat.push(a.id)));

    const idx = flat.findIndex(id => String(id) === String(currentId));
    if (idx === -1) return;

    if (idx > 0) {
        prevBtn.style.display = "inline-block";
        prevBtn.onclick = () => window.location.href = `/aula.html?id=${flat[idx - 1]}`;
    }

    if (idx < flat.length - 1) {
        nextBtn.style.display = "inline-block";
        nextBtn.onclick = () => window.location.href = `/aula.html?id=${flat[idx + 1]}`;
    }
}

/* ============================================================
   SIDEBAR HOVER
   ============================================================ */
try {
    sidebarEl.addEventListener("mouseenter", () => sidebarEl.classList.add("open"));
    sidebarEl.addEventListener("mouseleave", () => sidebarEl.classList.remove("open"));
} catch {}
