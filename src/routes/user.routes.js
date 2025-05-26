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

// import { Router } from "express";
// import userController from "../controllers/user.controller.js";
// import authMiddleware from "../middlewares/auth.middleware.js";

// const routes = Router()

// routes.post("/create",userController.create)
// routes.get("/all",userController.findAll)
// routes.get("/",authMiddleware,userController.findById)
// routes.patch("/",authMiddleware, userController.update)
// routes.patch("/delete",authMiddleware,userController.delete)
// // routes.delete("/delete",authMiddleware,userController.delete2)

// export default routes