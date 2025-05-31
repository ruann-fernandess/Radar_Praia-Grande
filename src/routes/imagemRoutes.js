import express from "express";
import multer from "multer";
import { cadastro, atualizarImagem } from "../controller/imagemController.js";
import { verificaAutenticacao } from "../controller/usuarioController.js";

const router = express.Router();

// Configurar Multer para armazenar os arquivos na memória
const upload = multer({ storage: multer.memoryStorage() });

// Definir a rota com Multer para processar uploads
router.post("/upload", upload.single("imagem"), cadastro);
router.post("/update", verificaAutenticacao, upload.single("imagem"), atualizarImagem);

export default router;
