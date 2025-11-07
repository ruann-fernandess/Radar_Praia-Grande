import express from "express";
import { verificaAutenticacao, loginAdmin, perfilAdmin, capturarUsuariosAdmin, desativarPerfilUsuarioAdmin, pesquisarUsuariosAdmin, ativarPerfilUsuarioAdmin } from "../controller/usuarioController.js";
import { aprovarDenunciaComentario, aprovarDenunciaNoticia, aprovarDenunciaUsuario, capturarDenunciasComentario, capturarDenunciasNoticia, capturarDenunciasUsuario, contarDenunciasComentarioPendentes, contarDenunciasNoticia, contarDenunciasNoticiaAprovadas, contarDenunciasNoticiaPendentes, contarDenunciasUsuario, contarDenunciasUsuarioAprovadas, contarDenunciasUsuarioPendentes, ignorarDenunciaComentario, ignorarDenunciaNoticia, ignorarDenunciaUsuario } from "../controller/denunciaController.js";
import { ativarNoticiaAdmin, capturarComentariosAdmin, capturarNoticiaAdmin, capturarNoticiasAdmin, contarDenunciasComentario, desativarNoticiaAdmin, pesquisarComentariosAdmin, pesquisarNoticiasAdmin } from "../controller/noticiaController.js";
const router = express.Router();

router.post("/login", loginAdmin);
router.get("/perfil", verificaAutenticacao, perfilAdmin);
router.get("/capturar-usuarios", verificaAutenticacao, capturarUsuariosAdmin);
router.get("/contar-denuncias-usuario/:apelido", verificaAutenticacao, contarDenunciasUsuario);
router.get("/contar-denuncias-usuario-aprovadas/:apelido", verificaAutenticacao, contarDenunciasUsuarioAprovadas);
router.get("/contar-denuncias-usuario-pendentes/:apelido", verificaAutenticacao, contarDenunciasUsuarioPendentes);
router.get("/capturar-denuncias-usuario/:apelido/:paginaDenunciasUsuario", verificaAutenticacao, capturarDenunciasUsuario);
router.post("/aprovar-denuncia-usuario", verificaAutenticacao, aprovarDenunciaUsuario);
router.post("/ignorar-denuncia-usuario", verificaAutenticacao, ignorarDenunciaUsuario);
router.get("/pesquisar-usuarios", verificaAutenticacao, pesquisarUsuariosAdmin);
router.post("/desativar-perfil-usuario", verificaAutenticacao, desativarPerfilUsuarioAdmin);
router.post("/ativar-perfil-usuario", verificaAutenticacao, ativarPerfilUsuarioAdmin);

router.get("/capturar-noticias", verificaAutenticacao, capturarNoticiasAdmin);
router.get("/contar-denuncias-noticia/:idNoticia", verificaAutenticacao, contarDenunciasNoticia);
router.get("/contar-denuncias-noticia-aprovadas/:idNoticia", verificaAutenticacao, contarDenunciasNoticiaAprovadas);
router.get("/contar-denuncias-noticia-pendentes/:idNoticia", verificaAutenticacao, contarDenunciasNoticiaPendentes);
router.get("/capturar-denuncias-noticia/:idNoticia/:paginaDenunciasNoticia", verificaAutenticacao, capturarDenunciasNoticia);
router.post("/aprovar-denuncia-noticia", verificaAutenticacao, aprovarDenunciaNoticia);
router.post("/ignorar-denuncia-noticia", verificaAutenticacao, ignorarDenunciaNoticia);
router.get("/pesquisar-noticias", verificaAutenticacao, pesquisarNoticiasAdmin);
router.post("/desativar-noticia", verificaAutenticacao, desativarNoticiaAdmin);
router.post("/ativar-noticia", verificaAutenticacao, ativarNoticiaAdmin);

router.get("/capturar-comentarios", verificaAutenticacao, capturarComentariosAdmin);
router.get("/pesquisar-comentarios", verificaAutenticacao, pesquisarComentariosAdmin);

router.get("/contar-denuncias-comentario/:idComentario", verificaAutenticacao, contarDenunciasComentario);
router.get("/contar-denuncias-comentario-pendentes/:idComentario", verificaAutenticacao, contarDenunciasComentarioPendentes);
router.get("/capturar-denuncias-comentario/:idComentario/:paginaDenunciasComentario", verificaAutenticacao, capturarDenunciasComentario);
router.post("/aprovar-denuncia-comentario", verificaAutenticacao, aprovarDenunciaComentario);
router.post("/ignorar-denuncia-comentario", verificaAutenticacao, ignorarDenunciaComentario);
router.get("/pesquisar-comentarios", verificaAutenticacao, pesquisarComentariosAdmin);

router.get("/capturar-noticia", verificaAutenticacao, capturarNoticiaAdmin);

export default router;