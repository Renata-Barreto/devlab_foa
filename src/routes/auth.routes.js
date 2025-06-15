// src/routes/auth.routes.js
import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login); // Alterado de "/" para "/login"

export default router;
