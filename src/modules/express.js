import { createTableUsuario } from "../model/usuarioModel.js";
// Criando as tabela
await createTableUsuario();

import express from "express";
const app = express();
app.use(express.json());

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default app;
