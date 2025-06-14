// src/routes/forum.routes.js
import { Router } from 'express';
import ForumController from '../controllers/ForumController.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/posts', ForumController.getPosts);
router.get('/categorias', ForumController.getCategorias);
router.get('/tags', ForumController.getTags);
router.post('/topicos', authMiddleware, ForumController.createTopico);
router.get('/topicos/:id', authMiddleware, ForumController.getTopicoById);
router.post('/respostas', authMiddleware, ForumController.createResposta);
router.post('/replies', authMiddleware, ForumController.createReply);
router.post('/topicos/:id/like', authMiddleware, ForumController.likeTopico);
router.post('/respostas/:id/like', authMiddleware, ForumController.likeResposta);
router.post('/topicos/:id/avaliar', authMiddleware, ForumController.avaliarTopico);

export default router;

// // src/routes/forum.routes.js
// import { Router } from 'express';
// import ForumController from '../controllers/ForumController.js';
// import authMiddleware from '../middlewares/auth.middleware.js';

// const router = Router();

// router.get('/posts', ForumController.getPosts);
// router.get('/categorias', ForumController.getCategorias);
// router.get('/tags', ForumController.getTags);
// router.post('/topicos', authMiddleware, ForumController.createTopico);
// router.get('/topicos/:id', authMiddleware, ForumController.getTopicoById);
// router.post('/respostas', authMiddleware, ForumController.createResposta);
// router.post('/replies', authMiddleware, ForumController.createReply);
// router.post('/topicos/:id/like', authMiddleware, ForumController.likeTopico);
// router.post('/respostas/:id/like', authMiddleware, ForumController.likeResposta);

// // Novos endpoints para gerenciamento de tópicos
// router.get('/meus-topicos', authMiddleware, ForumController.getMeusTopicos);
// router.patch('/topicos/:id/desativar', authMiddleware, ForumController.desativarTopico);
// router.patch('/topicos/:id/fechar', authMiddleware, ForumController.fecharTopico);
// router.put('/topicos/:id', authMiddleware, ForumController.editarTopico);
// router.delete('/topicos/:id', authMiddleware, ForumController.excluirTopico);

// export default router;

// // import { Router } from 'express';
// // import ForumController from '../controllers/ForumController.js';
// // import authMiddleware from '../middlewares/auth.middleware.js';

// // const router = Router();

// // router.get('/posts', ForumController.getPosts);
// // router.get('/categorias', ForumController.getCategorias);
// // router.get('/tags', ForumController.getTags);
// // router.post('/topicos', authMiddleware, ForumController.createTopico);
// // router.get('/topicos/:id', ForumController.getTopicoById);
// // router.post('/respostas', authMiddleware, ForumController.createResposta);
// // router.post('/replies', authMiddleware, ForumController.createReply);
// // router.post('/topicos/:id/like', authMiddleware, ForumController.likeTopico);
// // router.post('/respostas/:id/like', authMiddleware, ForumController.likeResposta);

// // export default router;