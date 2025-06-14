// src/routes/auth.routes.js
import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', login); // Alterado de "/" para "/login"

export default router;


// //MÉTODO ANTIGO
// import { Router } from "express";
// import {login} from '../controllers/auth.controller.js';
// import { authMiddleware } from "../middlewares/auth.middleware.js";

// const router = Router();

// router.post("/",login)

// export default router

// // src/routes/auth.routes.js
// import express from 'express';
// import { login } from '../controllers/auth.controller.js';

// const router = express.Router();

// router.post('/login', login);

// export default router;