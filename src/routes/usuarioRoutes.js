import express from "express";
import { cadastro } from "../controller/usuarioController.js";
import { login } from "../controller/usuarioController.js";
import { perfil } from "../controller/usuarioController.js";
import { verificaAutenticacao, alterarPerfil, apagarPerfil } from "../controller/usuarioController.js";


const router = express.Router();

// Rota para processar a requisição
router.post("/cadastro", cadastro);
router.post("/login", login);
router.get("/perfil", verificaAutenticacao, perfil);
router.put("/perfil", verificaAutenticacao, alterarPerfil, perfil);
router.delete("/perfil", verificaAutenticacao, apagarPerfil);


export default router;
