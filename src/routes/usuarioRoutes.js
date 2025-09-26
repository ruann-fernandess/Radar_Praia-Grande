import express from "express";
import { cadastro, login, perfil, verificaAutenticacao, alterarPerfil, apagarPerfil, logout, perfilOutroUsuario, verificaExistenciaAmizade, seguirUsuario, deixarDeSeguirUsuario, contarSeguidores, contarSeguindo, capturarSeguidores, capturarSeguindo, pesquisarUsuarios } from "../controller/usuarioController.js";

const router = express.Router();

router.post("/cadastro", cadastro);
router.post("/login", login);
router.get("/editar-perfil", verificaAutenticacao, perfil);
router.put("/editar-perfil", verificaAutenticacao, alterarPerfil);  // <-- Sem o perfil depois!
router.delete("/editar-perfil", verificaAutenticacao, apagarPerfil);
router.get("/perfil", verificaAutenticacao, perfil);
router.get("/perfil-outro-usuario/:apelidoOutroUsuario", verificaAutenticacao, perfilOutroUsuario);
router.get("/logout", logout);
router.get("/verifica-amizade/:apelido1/:apelido2", verificaAutenticacao, verificaExistenciaAmizade);
router.get("/seguir-usuario/:apelido1/:apelido2", verificaAutenticacao, seguirUsuario);
router.get("/deixar-seguir-usuario/:apelido1/:apelido2", verificaAutenticacao, deixarDeSeguirUsuario);
router.get("/contar-seguidores/:apelido", verificaAutenticacao, contarSeguidores);
router.get("/contar-seguindo/:apelido", verificaAutenticacao, contarSeguindo);
router.get("/capturar-seguidores", verificaAutenticacao, capturarSeguidores);
router.get("/capturar-seguindo", verificaAutenticacao, capturarSeguindo);
router.get("/pesquisar-usuarios", verificaAutenticacao, pesquisarUsuarios);

export default router;
