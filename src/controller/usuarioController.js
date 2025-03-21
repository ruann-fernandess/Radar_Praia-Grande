import { /*createTableUsuario, */ verificaEmail, verificaApelidoUsuario, insertUsuario } from "../model/usuarioModel.js";

export async function cadastro(req, res) {
    try {
        //await createTableUsuario(); // Criar a tabela antes do cadastro
        
        const { nm_email_usuario, cd_apelido_usuario } = req.body;
        const emailExiste = await verificaEmail(nm_email_usuario);
        const usuarioExiste = await verificaApelidoUsuario(cd_apelido_usuario);

        if (emailExiste > 0 || usuarioExiste > 0) {
            if (emailExiste > 0 && usuarioExiste > 0) {
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
            message: "❌ Erro ao cadastrar usuário: " + error.message 
        });
    }
}
