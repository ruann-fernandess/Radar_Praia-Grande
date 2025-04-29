import express from "express";
import { cadastro } from "../controller/usuarioController.js";
import { login } from "../controller/usuarioController.js";
import { perfil } from "../controller/usuarioController.js";
import { verificaAutenticacao, alterarPerfil, apagarPerfil } from "../controller/usuarioController.js";


const router = express.Router();

// Rota para processar a requisição
router.post("/cadastro", cadastro);
router.post("/login", login);
router.get("/editar-perfil", verificaAutenticacao, perfil);
router.put("/editar-perfil", verificaAutenticacao, alterarPerfil, perfil);
router.delete("/editar-perfil", verificaAutenticacao, apagarPerfil);
router.get("/perfil", verificaAutenticacao, perfil);




export default router;
