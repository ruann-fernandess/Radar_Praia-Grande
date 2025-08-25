import express from "express";
import { cadastro, login, perfil, verificaAutenticacao, alterarPerfil, apagarPerfil, logout, perfilOutroUsuario } from "../controller/usuarioController.js";

const router = express.Router();

router.post("/cadastro", cadastro);
router.post("/login", login);
router.get("/editar-perfil", verificaAutenticacao, perfil);
router.put("/editar-perfil", verificaAutenticacao, alterarPerfil);  // <-- Sem o perfil depois!
router.delete("/editar-perfil", verificaAutenticacao, apagarPerfil);
router.get("/perfil", verificaAutenticacao, perfil);
router.get("/perfil-outro-usuario/:apelidoOutroUsuario", verificaAutenticacao, perfilOutroUsuario);
router.get("/logout", logout);

export default router;
