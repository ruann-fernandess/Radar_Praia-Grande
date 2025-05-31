import express from "express";
import multer from "multer";
import { cadastro, capturarBairros, analisarDescricao, analisarImagem, capturarNoticiasDoUsuario, capturarNoticiaDoUsuario, editarNoticia, apagarNoticia } from "../controller/noticiaController.js";
import { verificaAutenticacao } from "../controller/usuarioController.js";
const router = express.Router();

// Configurar Multer para armazenar os arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definir a rota com Multer para processar uploads
router.get("/capturar-bairros", verificaAutenticacao, capturarBairros);
router.post("/analisar-descricao", verificaAutenticacao, analisarDescricao);
router.post("/analisar-imagem", upload.single("imagem"), verificaAutenticacao, analisarImagem);
router.post("/cadastro", verificaAutenticacao, cadastro);
router.get("/capturar-noticias-usuario/:apelido", verificaAutenticacao, capturarNoticiasDoUsuario);
router.get("/capturar-noticia-usuario/:idNoticia", verificaAutenticacao,  capturarNoticiaDoUsuario);
router.post("/editar-noticia", verificaAutenticacao, editarNoticia);
router.post("/apagar-noticia", verificaAutenticacao, apagarNoticia);

export default router;
