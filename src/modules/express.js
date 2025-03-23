import { createTableUsuario } from "../model/usuarioModel.js";
// Criando as tabela
await createTableUsuario();

// Permite o uso de APIs e recursos externos. Sem o CORS tais recursos estariam bloqueados
import express from "express";
import cors from "cors";
import multer from "multer";
const app = express();
app.use(express.json());

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

app.get("/cadastro-publicacao.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/cadastro-publicacao.html"));
});

app.get("/editar-publicacao.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/editar-publicacao.html"));
});

app.get("/resultados-pesquisa.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/resultados-pesquisa.html"));
});

app.get("/perfil", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/perfil.html"));
});

app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/admin.html"));
});

app.get("/consultar-usuarios.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/consultar-usuarios.html"));
});

app.get("/consultar-publicacoes.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/consultar-publicacoes.html"));
});

app.get("/consultar-comentarios.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../view/consultar-comentarios.html"));
});

// Importando as rotas relacionadas ao usuário
import usuarioRoutes from "../routes/usuarioRoutes.js";
// Definindo as rotas para funções atreladas ao usuário (como cadastro, login, etc.)
app.use("/usuario", usuarioRoutes);

// Importando as rotas relacionadas a publicação
import publicacaoRoutes from "../routes/publicacaoRoutes.js";
// Definindo as rotas para funções atreladas a publicacao (como validação de descrição, imagens, etc.)
app.use("/publicacao", publicacaoRoutes);

export default app;
