const API = "/api/curso";

let cursoId = new URLSearchParams(location.search).get("curso");
if (!cursoId) cursoId = 1;

let curso = null;
let aulaAtual = null;
let indexGlobal = [];

const modulesWrapper = document.getElementById("modulesWrapper");
const title = document.getElementById("lessonTitle");
const subtitle = document.getElementById("lessonSub");
const body = document.getElementById("lessonBody");
const skeleton = document.getElementById("skeleton");
const btnConcluir = document.getElementById("btnConcluir");

const percentText = document.getElementById("percentText");
const topProgress = document.getElementById("topProgress");
const stepsText = document.getElementById("stepsText");


// ==========================
// FETCH DO CURSO
// ==========================
async function carregarCurso() {
  const r = await fetch(`${API}/${cursoId}`, {
    headers: { Authorization: localStorage.getItem("token") }
  });

  curso = await r.json();
  montarSidebar();
}
carregarCurso();


// ==========================
// SIDEBAR
// ==========================
function montarSidebar() {
  modulesWrapper.innerHTML = "";
  indexGlobal = [];

  curso.modulos.forEach((mod, mi) => {
    const block = document.createElement("div");
    block.className = "module-block";

    const header = document.createElement("div");
    header.className = "module-header";
    header.innerHTML = `<strong>${mod.nome}</strong>`;
    block.appendChild(header);

    const list = document.createElement("div");
    list.className = "lessons-list";

    mod.aulas.forEach((aula, ai) => {
      indexGlobal.push({ modulo: mi, aula: ai });

      const item = document.createElement("div");
      item.className = "lesson-item";
      item.innerHTML = `
        <div>
          <strong>${aula.titulo}</strong>
          <div class="lesson-sub">${aula.sub}</div>
        </div>
      `;

      // === Bloqueio de aulas ===
      const prev = indexGlobal.length - 2;
      if (!aula.status && prev >= 0 && curso.modulos[indexGlobal[prev].modulo].aulas[indexGlobal[prev].aula].status !== "concluida") {
        item.classList.add("lesson-locked");
        item.innerHTML += `<div class="tooltip">Complete a aula anterior</div>`;
      } else {
        item.onclick = () => abrirAula(aula.id);
      }

      list.appendChild(item);
    });

    block.appendChild(list);
    modulesWrapper.appendChild(block);
  });
}


// ==========================
// ABRIR AULA
// ==========================
async function abrirAula(idAula) {
  mostrarSkeleton(true);

  const r = await fetch(`${API}/aula/${idAula}`, {
    headers: { Authorization: localStorage.getItem("token") }
  });

  const aula = await r.json();
  aulaAtual = aula;

  title.textContent = aula.titulo;
  subtitle.textContent = aula.descricao || "";
  body.innerHTML = aula.conteudo;

  marcarActive(aula.aula_id);
  atualizarBotoes();
  atualizarProgresso();

  mostrarSkeleton(false);
  btnConcluir.style.display = "block";
}


// ==========================
// MARCAR COMO CONCLUÍDA
// ==========================
btnConcluir.onclick = async () => {
  await fetch(`${API}/aula/${aulaAtual.aula_id}/concluir`, {
    method: "PATCH",
    headers: { Authorization: localStorage.getItem("token") }
  });

  await carregarCurso();
  abrirAula(aulaAtual.aula_id);
};


// ==========================
// SKELETON
// ==========================
function mostrarSkeleton(show) {
  skeleton.style.display = show ? "block" : "none";
  title.style.display = show ? "none" : "block";
  subtitle.style.display = show ? "none" : "block";
  body.style.display = show ? "none" : "block";
}


// ==========================
// UPDATE ACTIVE ITEM
// ==========================
function marcarActive(id) {
  document.querySelectorAll(".lesson-item").forEach(el => el.classList.remove("active"));
  const sel = [...document.querySelectorAll(".lesson-item")].find(el =>
    el.innerText.includes(aulaAtual.titulo)
  );
  if (sel) sel.classList.add("active");
}


// ==========================
// PREV / NEXT
// ==========================
function atualizarBotoes() {
  const index = indexGlobal.findIndex(e => curso.modulos[e.modulo].aulas[e.aula].id === aulaAtual.aula_id);

  const prevBtn = document.getElementById("prevLesson");
  const nextBtn = document.getElementById("nextLesson");
  const prevTop = document.getElementById("prevTop");
  const nextTop = document.getElementById("nextTop");

  prevBtn.onclick = prevTop.onclick = () => {
    if (index > 0) {
      const prev = indexGlobal[index - 1];
      abrirAula(curso.modulos[prev.modulo].aulas[prev.aula].id);
    }
  };

  nextBtn.onclick = nextTop.onclick = () => {
    if (index < indexGlobal.length - 1) {
      const next = indexGlobal[index + 1];
      abrirAula(curso.modulos[next.modulo].aulas[next.aula].id);
    }
  };
}


// ==========================
// PROGRESSO
// ==========================
function atualizarProgresso() {
  const total = indexGlobal.length;
  const concluídas = indexGlobal.filter(i => curso.modulos[i.modulo].aulas[i.aula].status === "concluida").length;

  const pct = Math.floor(concluídas / total * 100);

  percentText.textContent = `${pct}% COMPLETO`;
  stepsText.textContent = `${concluídas} / ${total} aulas`;
  topProgress.style.width = pct + "%";
}
