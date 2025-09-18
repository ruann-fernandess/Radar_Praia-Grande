import { createTableUsuario } from "../model/usuarioModel.js";
import { createTableAmizade } from "../model/amizadeModel.js";
import { createTableBairro } from "../model/bairroModel.js";
import { createTableNoticia } from "../model/noticiaModel.js";
import { createTableImagem } from "../model/imagemModel.js";
import { createTableCurtidaNoticia } from "../model/curtidaNoticiaModel.js";
import { createTableComentario } from "../model/comentarioModel.js";
import { createTableCurtidaComentario } from "../model/curtidaComentarioModel.js";
// Criando as tabelas
await createTableUsuario();
await createTableAmizade();
await createTableBairro();
await createTableNoticia();
await createTableImagem();
await createTableCurtidaNoticia();
await createTableComentario();
await createTableCurtidaComentario();

import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import { impedeUsuariosAutenticados, verificaAutenticacao } from "../controller/usuarioController.js";
import { buscarUsuarioPorApelido } from "../model/usuarioModel.js";

// Configurações para __dirname com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Configuração do session com memorystore
const memorystore = await import("memorystore").then(m => m.default);
const MemoryStore = memorystore(session);

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new MemoryStore({ checkPeriod: 86400000 }),
    saveUninitialized: false,
    resave: false,
    cookie: { 
        maxAge: 60000 * 60,
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Middlewares gerais
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Multer config para upload
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Servir arquivos estáticos da pasta public
app.use(express.static("public"));

// Redirecionar index.html para /
app.get("/index.html", (req, res) => {
    res.redirect("/");
});

app.get("/", impedeUsuariosAutenticados, (req, res) => {
    res.sendFile(path.join(__dirname, "../view/index.html"));
});

app.get("/cadastro.html", impedeUsuariosAutenticados, (req, res) => {
    res.sendFile(path.join(__dirname, "../view/cadastro.html"));
});

app.get("/login.html", impedeUsuariosAutenticados, (req, res) => {
    res.sendFile(path.join(__dirname, "../view/login.html"));
});

// Rotas que provavelmente precisam de autenticação — adicione middleware verificaAutenticacao no router específico
app.get("/home.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/home.html"));
});
app.get("/cadastro-noticia.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/cadastro-noticia.html"));
});
app.get("/editar-noticia.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/editar-noticia.html"));
});
app.get("/resultados-pesquisa.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/resultados-pesquisa.html"));
});
app.get("/editar-perfil.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/editar-perfil.html"));
});
app.get("/perfil.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/perfil.html"));
});
app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/admin.html"));
});
app.get("/consultar-usuarios.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/consultar-usuarios.html"));
});
app.get("/consultar-noticias.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/consultar-noticias.html"));
});
app.get("/consultar-comentarios.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/consultar-comentarios.html"));
});
app.get("/perfil/:apelidoOutroUsuario", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/perfil-outro-usuario.html"));
});

// Importação e uso das rotas especializadas
import usuarioRoutes from "../routes/usuarioRoutes.js";
import noticiaRoutes from "../routes/noticiaRoutes.js";
import imagemRoutes from "../routes/imagemRoutes.js";

app.use("/usuario", usuarioRoutes);
app.use("/noticia", noticiaRoutes);
app.use("/imagem", imagemRoutes);

export default app;
