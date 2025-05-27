import express from "express";
import multer from "multer";
import { cadastro, capturarBairros, analisarDescricao, analisarImagem, capturarNoticiasDoUsuario, capturarNoticiaDoUsuario, editarNoticia, apagarNoticia } from "../controller/noticiaController.js";

const router = express.Router();

// Configurar Multer para armazenar os arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definir a rota com Multer para processar uploads
router.get("/capturar-bairros", capturarBairros);
router.post("/analisar-descricao", analisarDescricao);
router.post("/analisar-imagem", upload.single("imagem"), analisarImagem);
router.post("/cadastro", cadastro);
router.get("/capturar-noticias-usuario/:apelido", capturarNoticiasDoUsuario);
router.get("/capturar-noticia-usuario/:idNoticia", capturarNoticiaDoUsuario);
router.post("/editar-noticia", editarNoticia);
router.post("/apagar-noticia", apagarNoticia);

export default router;
