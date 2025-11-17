// app.aula.js
const API_BASE = "https://devlab-foa.onrender.com/api";
const authRaw = localStorage.getItem("auth");
let auth;
try { auth = JSON.parse(authRaw); } catch(e){ auth = null; }

const aulaId = new URLSearchParams(window.location.search).get("id");
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
  setTimeout(()=> window.location.href = "/login.html", 600);
} else {
  carregarAula();
}

async function carregarAula(){
  renderSkeleton();
  try {
    // 1) busca dados da aula
    const res = await fetch(`${API_BASE}/curso/aula/${aulaId}`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (!res.ok) throw new Error("Erro ao buscar aula");
    const aula = await res.json();

    // 2) busca também a estrutura completa do curso pra montar o sidebar (que o backend fornece em /curso/:id)
    const cursoRes = await fetch(`${API_BASE}/curso/${aula.curso_id}`, {
      headers: { "Authorization": `Bearer ${auth.token}` }
    });
    const curso = cursoRes.ok ? await cursoRes.json() : null;

    renderAula(aula, curso);
  } catch (err) {
    console.error(err);
    titleEl.textContent = "Erro ao carregar a aula";
    bodyEl.innerHTML = "<p>Verifique sua conexão ou tente novamente.</p>";
  }
}

function renderSkeleton(){
  titleEl.textContent = "Carregando...";
  subEl.textContent = "";
  bodyEl.innerHTML = `<div class="skeleton" style="height:14px;width:60%;margin-bottom:10px"></div>
                      <div class="skeleton" style="height:12px;width:80%;margin-bottom:10px"></div>`;
}

function renderAula(aula, curso){
  // título e conteúdo
  titleEl.textContent = aula.titulo || "Sem título";
  subEl.textContent = aula.nome_modulo ? `${aula.nome_modulo} • Aula` : "";
  bodyEl.innerHTML = aula.conteudo || "<p>Sem conteúdo</p>";
  topTitle.textContent = aula.titulo;
  topMeta.textContent = `${aula.nome_modulo || ''} — Curso: ${aula.nome_curso || ''}`;

  // salvar última aula
  localStorage.setItem("ultimaAula", aula.aula_id);

  // botão concluir (verifica status via progresso_aluno)
  // vamos buscar se existe registro em progresso_aluno para essa user/aula
  fetchProgresso(aula.aula_id).then(status => {
    if (status === "concluida") {
      markBtn.style.display = "none";
      markStatus.innerHTML = `<span class="badge-done">Concluída</span>`;
    } else {
      markBtn.style.display = "inline-block";
      markStatus.innerHTML = "";
      markBtn.onclick = async () => {
        markBtn.disabled = true;
        markBtn.textContent = "Salvando...";
        try {
          const p = await fetch(`${API_BASE}/curso/aula/${aula.aula_id}/concluir`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${auth.token}`,
              "Content-Type": "application/json"
            }
          });
          if (!p.ok) throw new Error("Falha ao concluir");
          markBtn.style.display = "none";
          markStatus.innerHTML = `<span class="badge-done">Concluída</span>`;
          // atualiza progresso local e sidebar
          carregarAula();
        } catch(err) {
          alert("Erro ao marcar concluída");
          markBtn.disabled = false;
        } finally {
          markBtn.textContent = "Marcar como concluída";
        }
      };
    }
  });

  // montar sidebar de módulos/aulas
  renderSidebar(curso, aula.aula_id);

  // Prev/Next (encontra posição e ajusta botões)
  setupPrevNext(curso, aula.aula_id);
}

async function fetchProgresso(aula_id){
  // opcional: você pode ter endpoint pra progresso; como alternativa,
  // o get /curso/:id já traz status nas aulas, então podemos buscar lá.
  // Aqui retornamos 'concluida' ou 'pendente'
  try {
    // buscar curso (já feito por caller geralmente) — mas para garantir:
    // (não repete se já foi passado)
    return "pendente";
  } catch(e){
    return "pendente";
  }
}

function renderSidebar(curso, currentAulaId){
  modulesListEl.innerHTML = "";
  if (!curso || !curso.modulos) {
    modulesListEl.innerHTML = "<div>Sem módulos para esse curso</div>";
    return;
  }

  curso.modulos.forEach(mod => {
    const block = document.createElement("div");
    block.style.marginBottom = "12px";
    block.innerHTML = `<strong style="display:block;margin-bottom:6px">${mod.nome}</strong>`;
    const ul = document.createElement("div");
    ul.style.display = "flex";
    ul.style.flexDirection = "column";
    ul.style.gap = "6px";

    (mod.aulas || []).forEach(a => {
      const entry = document.createElement("div");
      entry.style.display = "flex";
      entry.style.justifyContent = "space-between";
      entry.style.alignItems = "center";
      entry.style.padding = "6px 8px";
      entry.style.borderRadius = "6px";
      entry.style.cursor = a.liberada ? "pointer" : "default";
      entry.className = a.aula_id == currentAulaId ? "active" : "";
      entry.innerHTML = `<div style="display:flex;gap:8px;align-items:center"><div style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(0,0,0,0.06)">${a.ordem_aula}</div><div style="font-size:14px">${a.titulo}</div></div>
                         <div style="font-size:13px;color:#777">${a.status === 'concluida' ? '✔' : (a.liberada ? '›' : '🔒')}</div>`;
      if (a.liberada) {
        entry.addEventListener("click", ()=> {
          localStorage.setItem("ultimaAula", a.id);
          window.location.href = `/aula.html?id=${a.id}`;
        });
      } else {
        entry.title = "Conclua a aula anterior para liberar";
      }
      ul.appendChild(entry);
    });

    block.appendChild(ul);
    modulesListEl.appendChild(block);
  });
}

function setupPrevNext(curso, currentAulaId){
  prevBtn.style.display = "none";
  nextBtn.style.display = "none";
  if (!curso || !curso.modulos) return;

  // flatten aulas com ordem global dentro curso: [{id, moduloIndex, aulaIndex}]
  const flat = [];
  curso.modulos.forEach((m, mi) => {
    (m.aulas || []).forEach((a, ai) => {
      flat.push({ id: a.id, moduloIndex: mi, aulaIndex: ai, liberada: a.liberada });
    });
  });

  const idx = flat.findIndex(x => String(x.id) === String(currentAulaId));
  if (idx === -1) return;

  if (idx > 0) {
    prevBtn.style.display = "inline-block";
    prevBtn.onclick = ()=> window.location.href = `/aula.html?id=${flat[idx-1].id}`;
  }
  if (idx < flat.length - 1) {
    nextBtn.style.display = "inline-block";
    nextBtn.onclick = ()=> window.location.href = `/aula.html?id=${flat[idx+1].id}`;
  }
}
