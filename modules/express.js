import { createTable, insertUsuario, updateUsuario, verificaEmail, verificaApelidoUsuario } from "../controler/usuario.js";
import express from "express";
const app = express();
app.use(express.json());

createTable();

app.post("/cadastro", async (req, res) => {
    try {
        const { nm_email_usuario, cd_apelido_usuario } = req.body; // Pegando o e-mail do corpo da requisição
        const emailExiste = await verificaEmail(nm_email_usuario);
        const usuarioExiste = await verificaApelidoUsuario(cd_apelido_usuario);

        if (emailExiste > 0  || usuarioExiste > 0) {
            if (emailExiste > 0  && usuarioExiste > 0) {
                return res.status(400).json({ 
                    statusCode: 400, 
                    message: "❌ O e-mail e o usuário já estão cadastrados." 
                });
            } else if (emailExiste > 0) {
                return res.status(400).json({ 
                    statusCode: 400, 
                    message: "❌ O e-mail já está cadastrado." 
                });
            } else if (usuarioExiste > 0) {
                return res.status(400).json({ 
                    statusCode: 400, 
                    message: "❌ O usuário já está cadastrado." 
                });
            } 
        }

        await insertUsuario(req.body);
        res.status(200).json({ 
            statusCode: 200, 
            message: "✅ Cadastro realizado com sucesso!" 
        });

    } catch (error) {
        res.status(500).json({ 
            statusCode: 500, 
            message: "Erro ao cadastrar usuário: " + error.message 
        });
    }
});

  
  import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(__dirname, "../cadastro.html"));
});


app.put("/cadastro", (req, res) => {
if(req.body) {
  updateUsuario(req.body);
  res.json({ statusCode: 200 })
  };
});

export default app;
