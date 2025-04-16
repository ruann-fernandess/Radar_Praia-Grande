import express from "express";
import multer from "multer";
import { analisarDescricao, analisarImagem } from "../controller/noticiaController.js";

const router = express.Router();

// Configurar Multer para armazenar os arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definir a rota com Multer para processar uploads
router.post("/analisarDescricao", analisarDescricao);
router.post("/analisarImagem", upload.single("imagem"), analisarImagem);

export default router;
