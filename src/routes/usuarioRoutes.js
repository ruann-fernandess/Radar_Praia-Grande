import express from "express";
import { cadastro } from "../controller/usuarioController.js";

const router = express.Router();

// Rota para processar a requisição
router.post("/cadastro", cadastro);

export default router;
