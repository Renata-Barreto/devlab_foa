import { Router } from 'express';
const router = Router();
import authMiddleware from '../middlewares/auth.middleware';
import cursoController from '../controllers/curso.controller.js';

router.get('/', cursoController.getCursos);
router.get('/:id',authMiddleware, cursoController.getCursoById);




export default router