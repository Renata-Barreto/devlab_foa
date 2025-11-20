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
          aberto: false, // <-- já inicializa
          aulas: [],
        };
      }

      mapa[r.modulo_id].aulas.push({
        id: r.aula_id,
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

    curso.modulos.forEach((mod) => {
      // 1. liberar primeira aula
      if (curso.modulos.length > 0 && curso.modulos[0].aulas.length > 0) {
        curso.modulos[0].aulas[0].liberada = true;
      }
      // 2. liberar a próxima aula após concluída
      for (let i = 0; i < mod.aulas.length - 1; i++) {
        if (mod.aulas[i].status === "concluida") {
          mod.aulas[i + 1].liberada = true;
        }
      }
      // 3. definir módulo aberto (se tem aula liberada OU concluída)
      mod.aberto = mod.aulas.some(
        (a) => a.liberada || a.status === "concluida"
      );
      // 4. módulo concluído
      mod.concluido = mod.aulas.every((a) => a.status === "concluida");
      // NUMERAÇÃO GLOBAL
      let numero = 1;
      curso.modulos.forEach((mod) => {
        mod.aulas.forEach((a) => {
          a.numeroGlobal = numero;
          numero++;
        });
      });
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
  },
};

export default cursoService;
