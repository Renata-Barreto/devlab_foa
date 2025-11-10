import Curso from "../models/Curso.js";
const cursoService = {
  getAllCursos: async () => {
    return await Curso.findAll();
  },
  getCursoById: async (id, userId) => {
    const result = await Curso.findById(id, userId);
    if (!curso) {
      throw new Error("Curso não encontrado ou acesso negado");
    }
    const curso = {
      id: result.rows[0].curso_id,
      nome: result.rows[0].nome_curso,
      progresso: result.rows[0].progresso,
      modulos: [],
    };

    let moduloAtual = null;

    for (const row of result.rows) {
      if (!moduloAtual || moduloAtual.id !== row.modulo_id) {
        moduloAtual = {
          id: row.modulo_id,
          nome: row.nome_modulo,
          concluido: false,
          aulas: [],
        };
        curso.modulos.push(moduloAtual);
      }

      
      moduloAtual.aulas.push({
        id: row.aula_id,
        nome: row.nome_aula,
        status: row.status_aula,
      });
    }

  
    curso.modulos.forEach((m) => {
      const todasConcluidas = m.aulas.every((a) => a.status === "concluida");
      m.concluido = todasConcluidas;
    });

    return curso;
  },
};

export default cursoService;
