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
      progresso: result.rows[0].progresso,
      modulos: []
    };

    const mapa = {};

    result.rows.forEach(r => {
      if (!mapa[r.modulo_id]) {
        mapa[r.modulo_id] = {
          id: r.modulo_id,
          nome: r.nome_modulo,
          ordem_modulo: r.ordem_modulo,
          concluido: false,
          aulas: []
        };
      }

      mapa[r.modulo_id].aulas.push({
        id: r.aula_id,
        titulo: r.nome_aula,
        subtitulo: r.subtitulo || "Aula do curso",
        conteudo: r.conteudo || "",
        ordem_aula: r.ordem_aula,
        status: r.aula_concluida ? "concluida" : "pendente"
      });
    });

    curso.modulos = Object.values(mapa)
      .sort((a, b) => a.ordem_modulo - b.ordem_modulo)
      .map(mod => {
        mod.aulas.sort((a, b) => a.ordem_aula - b.ordem_aula);
        mod.concluido = mod.aulas.every(a => a.status === "concluida");
        return mod;
      });

    return curso;
  },

  concluirAula: async (aulaId, userId) => {
    const aula = await Curso.concluirAula(aulaId, userId);
    if (!aula.rowCount) throw new Error("Aula não encontrada");

    return { message: "Aula concluída com sucesso" };
  },

  getAulaById: async (aulaId) => {
    const aula = await Curso.getAulaById(aulaId);
    if (!aula) throw new Error("Aula não encontrada");
    return aula;
  }
};

export default cursoService;
