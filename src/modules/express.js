import { createTableUsuario } from "../model/usuarioModel.js";
import { createTableAmizade } from "../model/amizadeModel.js";
import { createTableBairro } from "../model/bairroModel.js";
import { createTableNoticia } from "../model/noticiaModel.js";
import { createTableArquivo } from "../model/arquivoModel.js";
import { createTableCurtidaNoticia } from "../model/curtidaNoticiaModel.js";
import { createTableComentario } from "../model/comentarioModel.js";
import { createTableCurtidaComentario } from "../model/curtidaComentarioModel.js";
// Criando as tabelas
await createTableUsuario();
await createTableAmizade();
await createTableBairro();
await createTableNoticia();
await createTableArquivo();
await createTableCurtidaNoticia();
await createTableComentario();
await createTableCurtidaComentario();

import express from "express";
import session from "express-session";

import dotenv from "dotenv";
dotenv.config();

// Permite o uso de APIs e recursos externos. Sem o CORS tais recursos estariam bloqueados
import cors from "cors";
import multer from "multer";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        secure: false
    }
}));


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
// Permite o uso de APIs e recursos externos. Sem o CORS tais recursos estariam bloqueados
app.use(cors());

// Configurar Multer para armazenar o arquivo em memória
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage, 
    // Limite de 50MB
    limits: { fileSize: 50 * 1024 * 1024 }
});

// Permite interpretar requisições JSON, transformando-os em objetos JavaScript
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Servindo arquivos estáticos da pasta "public"
app.use(express.static("public"));

// Se o caminho acessado for "index.html" redireciona para "/" (página inicial)
app.get("/index.html", (req, res) => {
    res.redirect("/");
});

// Renderizando as telas com base nos caminhos
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/index.html"));
});

app.get("/cadastro.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/cadastro.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/login.html"));
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

// Importando as rotas relacionadas ao usuário
import usuarioRoutes from "../routes/usuarioRoutes.js";
// Definindo as rotas para funções atreladas ao usuário (como cadastro, login, etc.)
app.use("/usuario", usuarioRoutes);

// Importando as rotas relacionadas a notícia
import noticiaRoutes from "../routes/noticiaRoutes.js";
// Definindo as rotas para funções atreladas a notícia (como validação de descrição, imagens, etc.)
app.use("/noticia", noticiaRoutes);

export default app;
