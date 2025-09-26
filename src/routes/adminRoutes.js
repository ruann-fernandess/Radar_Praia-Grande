import express from "express";
import { verificaAutenticacao, loginAdmin } from "../controller/usuarioController.js";
const router = express.Router();

router.post("/login", loginAdmin);

export default router;