import express from "express";
import multer from "multer";
import { cadastro, capturarBairros, analisarDescricao, analisarImagem, capturarNoticias, capturarNoticiasDoUsuario, capturarNoticiaDoUsuario, editarNoticia, apagarNoticia, curtirNoticia, removerCurtidaNoticia, verificaExistenciaCurtidaNoticia, contarCurtidasNoticia, contarComentariosNoticia, comentarNoticia, capturarComentariosNoticia, verificaExistenciaCurtidaComentarioNoticia, contarCurtidasComentarioNoticia, curtirComentarioNoticia, removerCurtidaComentarioNoticia, editarComentarioNoticia, apagarComentarioNoticia } from "../controller/noticiaController.js";
import { verificaAutenticacao } from "../controller/usuarioController.js";
const router = express.Router();

// Configurar Multer para armazenar os arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definir a rota com Multer para processar uploads
router.get("/capturar-bairros", verificaAutenticacao, capturarBairros);
router.post("/analisar-descricao", verificaAutenticacao, analisarDescricao);
router.post("/analisar-imagem", verificaAutenticacao, upload.single("imagem"), analisarImagem);
router.post("/cadastro", verificaAutenticacao, cadastro);
router.get("/capturar-noticias", verificaAutenticacao, capturarNoticias);
router.get("/capturar-noticias-usuario/:apelido", verificaAutenticacao, capturarNoticiasDoUsuario);
router.get("/capturar-noticia-usuario/:idNoticia", verificaAutenticacao,  capturarNoticiaDoUsuario);
router.post("/editar-noticia", verificaAutenticacao, editarNoticia);
router.post("/apagar-noticia", verificaAutenticacao, apagarNoticia);
router.post("/curtir-noticia", verificaAutenticacao, curtirNoticia);
router.post("/remover-curtida-noticia", verificaAutenticacao, removerCurtidaNoticia);
router.post("/verifica-curtida-noticia", verificaAutenticacao, verificaExistenciaCurtidaNoticia);
router.post("/contar-curtidas-noticia", verificaAutenticacao, contarCurtidasNoticia);
router.post("/contar-comentarios-noticia", verificaAutenticacao, contarComentariosNoticia);
router.post("/comentar-noticia", verificaAutenticacao, comentarNoticia);
router.get("/capturar-comentarios-noticia/:idNoticia", verificaAutenticacao, capturarComentariosNoticia);
// capturar-comentarios
router.post("/verifica-curtida-comentario-noticia", verificaAutenticacao, verificaExistenciaCurtidaComentarioNoticia);
router.post("/contar-curtidas-comentario-noticia", verificaAutenticacao, contarCurtidasComentarioNoticia);
router.post("/curtir-comentario-noticia", verificaAutenticacao, curtirComentarioNoticia);
router.post("/remover-curtida-comentario-noticia", verificaAutenticacao, removerCurtidaComentarioNoticia);
router.post("/editar-comentario-noticia", verificaAutenticacao, editarComentarioNoticia);
router.post("/apagar-comentario-noticia", verificaAutenticacao, apagarComentarioNoticia);

export default router;
