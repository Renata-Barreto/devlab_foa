
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
        
    }
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
    atualizarProgresso(curso);
    // PREV / NEXT
    atualizarBotoes(curso, aula);

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





// BOTÃO PRINCIPAL (FINAL DA PÁGINA)
const bottomBtn = document.createElement("button");
bottomBtn.id = "btnBottom";
bottomBtn.className = "btn-bottom";
document.querySelector(".conteudo").appendChild(bottomBtn);

// --- ATUALIZA TODOS OS BOTÕES DE NAVEGAÇÃO ---
function atualizarBotoes(curso, aulaAtual) {

    // ---- BOTÕES DO TOPO ----
    const lista = [];
    curso.modulos.forEach(m => m.aulas.forEach(a => lista.push(a)));
    const index = lista.findIndex(a => a.id == aulaAtual.id);

    // Botão anterior
    if (index <= 0) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
        prevBtn.onclick = () => {
            window.location.href = `/aula.html?id=${lista[index - 1].id}`;
        };
    }

    // Botão Próxima (TOPO)
    const proximaAula = lista[index + 1];

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

    // ---- BOTÃO DO FINAL ----
    if (!aulaAtual.concluida) {
        bottomBtn.textContent = "Concluir e ir para a próxima";
        bottomBtn.disabled = false;
        bottomBtn.onclick = async () => {
            await concluirAula(aulaAtual.id);

            if (proximaAula) {
                window.location.href = `/aula.html?id=${proximaAula.id}`;
            } else {
                bottomBtn.textContent = "Módulo concluído ✔";
                bottomBtn.disabled = true;
            }
        };
    } else {
        bottomBtn.textContent = proximaAula ? "Próxima aula" : "Módulo concluído";
        bottomBtn.disabled = false;

        if (proximaAula) {
            bottomBtn.onclick = () => {
                window.location.href = `/aula.html?id=${proximaAula.id}`;
            };
        } else {
            bottomBtn.disabled = true;
        }
    }
}

/* ============================================================
   SIDEBAR HOVER
   ============================================================ */
try {
    sidebarEl.addEventListener("mouseenter", () => sidebarEl.classList.add("open"));
    sidebarEl.addEventListener("mouseleave", () => sidebarEl.classList.remove("open"));
} catch {}

/* ============================================================
   NAV SUPERIOR COM PROGRESSO (USANDO API)
   ============================================================ */

// Criar NAV
const nav = document.createElement("div");
nav.id = "navProgresso";
nav.style.cssText = `
    width: 100%;
    background: #fff;
    border-bottom: 1px solid #eee;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    position: sticky;
    top: 0;
    z-index: 999;
`;

nav.innerHTML = `
    <button id="btnVoltar" style="
        background: #f5f5f5;
        border: 1px solid #ddd;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    ">◀ Voltar</button>

    <div style="flex: 1;">
        <div id="progressText" style="font-size: 15px; margin-bottom: 4px;"></div>
        
        <div style="
            width: 100%; 
            height: 6px; 
            background: #e5e5e5; 
            border-radius: 4px;
            overflow: hidden;
        ">
            <div id="progressBar" style="
                height: 6px;
                width: 0%;
                background: #4CAF50;
                transition: width .3s;
            "></div>
        </div>
    </div>
`;

document.body.prepend(nav);

// Botão voltar
document.getElementById("btnVoltar").onclick = () => history.back();


/* ============================================================
   ATUALIZA PROGRESSO (AGORA USANDO SUA API)
   ============================================================ */
function atualizarProgresso(curso){
    if (!curso || !curso.modulos) return;

    // recebe da API
    const pct = Number(curso.progresso) || 0;

    // calcular total e concluídas
    let total = 0;
    let concluidas = 0;

    curso.modulos.forEach(mod => {
        mod.aulas.forEach(a => {
            total++;
            if (a.status === "concluida") concluidas++;
        });
    });

    // texto (ex: 2/15 aulas — 14%)
    document.getElementById("progressText").textContent =
        `${concluidas}/${total} aulas — ${pct}%`;

    // barra
    document.getElementById("progressBar").style.width = pct + "%";
}
