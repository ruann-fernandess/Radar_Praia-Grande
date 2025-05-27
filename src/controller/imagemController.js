import { insertImagem, updateImagem } from "../model/imagemModel.js";

export async function cadastro(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Arquivo de imagem não enviado." });
    }

    const { apelido, idNoticia, identificador } = req.body;

    const novaImagem = {
      blob: req.file.buffer, // 👈 isso será o BLOB inserido
      apelido,
      idNoticia,
      identificador
    };

    const result = await insertImagem(novaImagem);

    res.status(result.statusCode).json({ message: result.message });

  } catch (error) {
    res.status(500).json({
      message: "❌ Erro ao cadastrar imagem: " + error.message
    });
  }
}

export async function atualizarImagem(req, res) {
  try {
    const imagemBlob = req.file.buffer;
    const { apelido, idNoticia, identificador } = req.body;

    const imagem = {
      blob: imagemBlob,
      idNoticia: idNoticia || null,
      apelido,
      identificador
    };

    const resultado = await updateImagem(imagem);
    res.status(resultado.statusCode).json(resultado);

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "❌ Erro ao atualizar imagem: " + error.message
    });
  }
}

