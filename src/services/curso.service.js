import Curso from "../models/Curso.js";

const cursoService = {
  getAllCursos: async () => {
    return await Curso.findAll();
  },

  getCursoById: async (id, userId) => {
    const result = await Curso.findById(id, userId);

    if (!result || result.rows.length === 0) {
      throw new Error("Curso não encontrado ou acesso negado");
    }

    const curso = {
      id: result.rows[0].curso_id,
      nome: result.rows[0].nome_curso,
      descricao: result.rows[0].descricao,
      progresso: result.rows[0].progresso,
      modulos: [],
    };

    const mapa = {};

    result.rows.forEach((r) => {
      if (!mapa[r.modulo_id]) {
        mapa[r.modulo_id] = {
          id: r.modulo_id,
          nome: r.nome_modulo,
          ordem_modulo: r.ordem_modulo,
          concluido: false,
          aberto: false,
          aulas: [],
        };
      }

      mapa[r.modulo_id].aulas.push({
        aula_id: r.aula_id,         
        titulo: r.nome_aula,
        conteudo: r.conteudo || "",
        status: r.aula_concluida ? "concluida" : "pendente",
        liberada: false,
        ordem_aula: r.ordem_aula,
      });
    });

    curso.modulos = Object.values(mapa)
      .sort((a, b) => a.ordem_modulo - b.ordem_modulo)
      .map((mod) => {
        mod.aulas.sort((a, b) => a.ordem_aula - b.ordem_aula);
        mod.concluido = mod.aulas.every((a) => a.status === "concluida");
        return mod;
      });

   curso.modulos.forEach((mod, index) => {

  
  if (index === 0) {
   
    mod.aulas[0].liberada = true;
  } else {
  
    const anterior = curso.modulos[index - 1];
    const anteriorConcluido = anterior.aulas.every(a => a.status === "concluida");

    if (anteriorConcluido) {
      mod.aulas[0].liberada = true;
    }
  }

 
  for (let i = 0; i < mod.aulas.length - 1; i++) {
    if (mod.aulas[i].status === "concluida") {
      mod.aulas[i + 1].liberada = true;
    }
  }

  
  mod.aberto = mod.aulas.some(a => a.liberada || a.status === "concluida");

  
  mod.concluido = mod.aulas.every(a => a.status === "concluida");
});

   
    let numeroGlobal = 1;
    curso.modulos.forEach(mod => {
      mod.aulas.forEach(a => {
        a.numeroGlobal = numeroGlobal++;
      });
    });

    return curso;
  },

  concluirAula: async (aula_id, userId) => {
    console.log("Service: concluir aula", aula_id, "userId", userId);

    return await Curso.concluirAula(aula_id, userId);
  },

  getAulaById: async (aula_id) => {
    const aula = await Curso.getAulaById(aula_id);
    if (!aula) throw new Error("Aula não encontrada");
    return aula;
  },
};

export default cursoService;
