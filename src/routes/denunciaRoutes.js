import express from "express";
import { capturarCategoriasDenuncia, verificaExistenciaDenunciaNoticia, verificaExistenciaDenunciaComentario, verificaExistenciaDenunciaUsuario, denunciarComentario, denunciarNoticia, denunciarUsuario } from "../controller/denunciaController.js";
import { verificaAutenticacao } from "../controller/usuarioController.js";
const router = express.Router();

// Definir a rota com Multer para processar uploads
router.get("/capturar-categorias-denuncia", verificaAutenticacao, capturarCategoriasDenuncia);
router.post("/verifica-denuncia-noticia", verificaAutenticacao, verificaExistenciaDenunciaNoticia);
router.post("/verifica-denuncia-comentario", verificaAutenticacao, verificaExistenciaDenunciaComentario);
router.post("/verifica-denuncia-usuario", verificaAutenticacao, verificaExistenciaDenunciaUsuario);
router.post("/denunciar-comentario", verificaAutenticacao, denunciarComentario);
router.post("/denunciar-noticia", verificaAutenticacao, denunciarNoticia);
router.post("/denunciar-usuario", verificaAutenticacao, denunciarUsuario);

export default router;