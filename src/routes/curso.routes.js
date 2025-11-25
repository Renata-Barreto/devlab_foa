import { Router } from 'express';
const router = Router();
import authMiddleware from '../middlewares/auth.middleware.js';
import cursoController from '../controllers/curso.controller.js';

router.get('/', cursoController.getCursos);


router.patch('/aula/:aula_id/concluir', authMiddleware,cursoController.concluirAula);
router.get('/aula/:aula_id', authMiddleware, cursoController.getAulaById);

router.get('/:id', authMiddleware, cursoController.getCursoById);

export default router;
