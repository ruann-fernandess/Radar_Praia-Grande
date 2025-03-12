
const express = require("express");
const app = express();
const port = 8080;

app.get("/home", (req, res) => {
    res.send("<h1>hello world</h1>");
});

app.listen(port, () => {
    console.log(`Rodando com express na porta ${port}!`);
});

module.exports = app; // Exporta o servidor
