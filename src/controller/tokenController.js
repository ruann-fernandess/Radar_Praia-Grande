import { selectDadosTokenConfirmarCadastroValidado, updateStatusValidadoToken, verificaToken } from "../model/tokenModel.js";
import { cadastro } from "./usuarioController.js";

export async function validarTokenConfirmarCadastro(req, res) {
  try {
    const { token } = req.params;
    const tokenInfo = await verificaToken(token, "Confirmar cadastro");

    if (!tokenInfo.existe) {
      return res.status(404).json({ statusCode: 404, message: "Token não encontrado" });
    }

    if (!tokenInfo.valido) {
      return res.status(400).json({ statusCode: 400, message: "Token já utilizado ou expirado" });
    }

    // Atualiza token como validado
    await updateStatusValidadoToken(1, token, "Confirmar cadastro");

    // Busca dados do token
    const dadosUsuario = await selectDadosTokenConfirmarCadastroValidado(token);
    if (dadosUsuario) {
      // Aqui cria o usuário na tabela USUARIO
      await cadastro({
        apelido: dadosUsuario.apelido,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        senha: dadosUsuario.senha
      });

      return res.status(200).json({ 
        statusCode: 200, 
        message: "Token de cadastro confirmado! Usuário criado com sucesso." 
      });
    } else {
      // Token validado, mas usuário já criado ou dados não encontrados
      return res.status(200).json({ 
        statusCode: 200, 
        message: "Token de cadastro confirmado com sucesso!" 
      });
    }

  } catch (error) {
    console.error("Erro ao validar token de cadastro:", error);
    res.status(500).json({ statusCode: 500, message: "Erro ao validar token" });
  }
}

export async function validarTokenRedefinirSenha(req, res) {
  try {
    const { token } = req.params;
    const tokenInfo = await verificaToken(token, "Redefinir senha");

    if (!tokenInfo.existe) {
      return res.status(404).json({ statusCode: 404, message: "Token não encontrado" });
    }

    if (!tokenInfo.valido) {
      return res.status(400).json({ statusCode: 400, message: "Token já utilizado ou expirado" });
    }

    // Token é válido, retornamos sucesso
    return res.status(200).json({
      statusCode: 200,
      message: "Token válido! Você pode prosseguir para redefinir a senha."
    });
  } catch (error) {
    console.error("Erro ao validar token de redefinição de senha:", error);
    return res.status(500).json({ statusCode: 500, message: "Erro ao validar token" });
  }
}
