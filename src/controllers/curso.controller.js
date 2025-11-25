import CursoService from '../services/curso.service.js';

const cursoController = {
  getCursos: async (req, res) => {
    try {
      const cursos = await CursoService.getAllCursos();
      res.json({ cursos });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getCursoById: async (req, res) => {
    try {
      const { id } = req.params;
      const curso = await CursoService.getCursoById(id, req.user.id_usr);
      res.json(curso);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  concluirAula: async (req, res) => {
    try {
      const { idAula } = req.params;
      const userId = req.user.id_usr;
console.log('Chamando CursoService.concluirAula com', idAula, userId);
      const response = await CursoService.concluirAula(idAula, userId);
      res.json(response);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  getAulaById: async (req, res) => {
    try {
      const { idAula } = req.params;
      const aula = await CursoService.getAulaById(idAula);
      res.json(aula);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};

export default cursoController;
