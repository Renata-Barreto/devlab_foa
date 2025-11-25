import { Router } from 'express';
const router = Router();
import authMiddleware from '../middlewares/auth.middleware.js';
import cursoController from '../controllers/curso.controller.js';

router.get('/', cursoController.getCursos);


router.patch('/aula/:idAula/concluir', authMiddleware,(req, res, next) => {
  console.log("PATCH /aula/:idAula/concluir chamada", req.params);
  next();
},cursoController.concluirAula);
router.get('/aula/:idAula', authMiddleware, cursoController.getAulaById);

router.get('/:id', authMiddleware, cursoController.getCursoById);

export default router;
