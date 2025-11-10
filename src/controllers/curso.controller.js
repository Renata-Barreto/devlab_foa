import CursoService from '../services/curso.service.js';

const cursoController = {
    getCursos: async (req, res) => {
        try {
            const cursos = await CursoService.getAllCursos();
            res.json({cursos});
            
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
},
    getCursoById: async (req, res) => {
        try {
            const { id } = req.params;
            const curso = await CursoService.getCursoById(id, req.user.id_usr);

            if (!curso) return res.status(404).json({ message: 'Curso não encontrado' });

            res.json(curso);
            
        } catch (e) {
            res.status(500).json({ error: e.message });
        }

    }
}
export default cursoController;