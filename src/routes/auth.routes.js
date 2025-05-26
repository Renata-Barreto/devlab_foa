import { Router } from "express";
import {login} from '../controllers/auth.controller.js';
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/",login)

export default router