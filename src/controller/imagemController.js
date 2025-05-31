import { insertImagem, updateImagem } from "../model/imagemModel.js";

export async function cadastro(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        statusCode: 400,
        message: "Arquivo de imagem não enviado." 
      });
    }

    const { apelido, idNoticia, identificador } = req.body;

    const novaImagem = {
      blob: req.file.buffer,
      apelido,
      idNoticia,
      identificador
    };

    const result = await insertImagem(novaImagem);

    res.status(result.statusCode).json({ 
      statusCode: result.statusCode,
      message: result.message 
    });

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao cadastrar imagem!"
    });
  }
}

export async function atualizarImagem(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        statusCode: 400,
        message: "Arquivo de imagem não enviado."
      });
    }

    const imagemBlob = req.file.buffer;
    const { apelido, idNoticia, identificador } = req.body;

    const imagem = {
      blob: imagemBlob,
      idNoticia: idNoticia || null,
      apelido,
      identificador
    };

    const result = await updateImagem(imagem);

    res.status(result.statusCode).json({ 
      statusCode: result.statusCode,
      message: result.message 
    });

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao atualizar imagem!"
    });
  }
}
