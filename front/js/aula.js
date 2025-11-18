// app.aula.js
const API_BASE = "https://devlab-foa.onrender.com/api";

const raw = localStorage.getItem("auth");
let auth = null;
try { auth = JSON.parse(raw); } catch { auth = null; }

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

if (!auth || !auth.token) {
    localStorage.removeItem("auth");
    window.location.href = "/login.html";
}

carregarAula();

async function carregarAula() {
    renderSkeleton();

    try {
        // 1 — Buscar aula com conteúdo
        const rAula = await fetch(`${API_BASE}/curso/aula/${aulaId}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        });

        if (!rAula.ok) throw new Error("Erro aula");

        const aula = await rAula.json();

        // 2 — Buscar estrutura completa do curso
        const rCurso = await fetch(`${API_BASE}/curso/${aula.curso_id}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
        });

        const curso = rCurso.ok ? await rCurso.json() : null;

        renderAula(aula, curso);

    } catch (e) {
        console.error(e);
        titleEl.textContent = "Erro ao carregar a aula";
        bodyEl.innerHTML = "<p>Erro ao conectar no servidor</p>";
    }
}

function renderSkeleton(){
    titleEl.textContent = "Carregando...";
    bodyEl.innerHTML = `
        <div class="skeleton" style="height:18px;width:70%"></div>
        <div class="skeleton" style="height:14px;width:80%"></div>
    `;
}

function renderAula(aula, curso){
    titleEl.textContent = aula.titulo;
    subEl.textContent = aula.nome_modulo;
    bodyEl.innerHTML = aula.conteudo;

    topTitle.textContent = aula.titulo;
    topMeta.textContent = `${aula.nome_modulo} — ${aula.nome_curso}`;

    localStorage.setItem("ultimaAula", aula.aula_id);

    // Botão concluir
    if (aula.concluida) {
        markBtn.style.display = "none";
        markStatus.innerHTML = `<span class="badge-done">Concluída</span>`;
    } else {
        markBtn.style.display = "inline-block";
        markBtn.onclick = () => concluirAula(aula.aula_id);
    }

    renderSidebar(curso, aula.aula_id);
    setupPrevNext(curso, aula.aula_id);
}

async function concluirAula(id){
    markBtn.disabled = true;
    markBtn.textContent = "Salvando...";

    const r = await fetch(`${API_BASE}/curso/aula/${id}/concluir`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json"
        }
    });

    if (r.ok) {
        carregarAula(); // recarrega tudo
    } else {
        alert("Erro ao concluir");
        markBtn.disabled = false;
        markBtn.textContent = "Marcar como concluída";
    }
}

function renderSidebar(curso, currentId){
    modulesListEl.innerHTML = "";

    if (!curso || !curso.modulos) return;

    curso.modulos.forEach(m => {
        const bloco = document.createElement("div");
        bloco.innerHTML = `<strong>${m.nome}</strong>`;
        const lista = document.createElement("div");

        m.aulas.forEach(a => {
            const div = document.createElement("div");
            div.className = (a.id == currentId) ? "active" : "";
            div.style.cursor = "pointer";

            div.innerHTML = `
                <span>${a.nome}</span>
                <span>${a.status === "concluida" ? "✔" : "•"}</span>
            `;

            div.onclick = () => {
                window.location.href = `/aula.html?id=${a.id}`;
            };

            lista.appendChild(div);
        });

        bloco.appendChild(lista);
        modulesListEl.appendChild(bloco);
    });
}

function setupPrevNext(curso, currentId){
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";

    const flat = [];

    curso.modulos.forEach(m => {
        m.aulas.forEach(a => flat.push(a.id));
    });

    const i = flat.indexOf(Number(currentId));

    if (i > 0) {
        prevBtn.style.display = "inline-block";
        prevBtn.onclick = () => window.location.href = `/aula.html?id=${flat[i-1]}`;
    }

    if (i < flat.length - 1) {
        nextBtn.style.display = "inline-block";
        nextBtn.onclick = () => window.location.href = `/aula.html?id=${flat[i+1]}`;
    }
}
