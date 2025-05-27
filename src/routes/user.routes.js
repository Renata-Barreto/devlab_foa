import express from 'express';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', userController.create);
router.get('/all', userController.findAll);
router.get('/', authMiddleware, userController.findById);
router.patch('/', authMiddleware, userController.update);
router.delete('/', authMiddleware, userController.delete);
router.delete('/delete', authMiddleware, userController.delete1);

export default router;