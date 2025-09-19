import { selectCategoriasDenuncia } from "../model/categoriaDenunciaModel.js";
import { verificaNoticia } from "../model/noticiaModel.js";
import { verificaComentarioNoticia } from "../model/comentarioModel.js";
import { verificaApelidoUsuario } from "../model/usuarioModel.js";
import { verificaDenunciaNoticia, insertDenunciaNoticia } from "../model/denunciaNoticiaModel.js";
import { verificaDenunciaComentario, insertDenunciaComentario } from "../model/denunciaComentarioModel.js";
import { verificaDenunciaUsuario, insertDenunciaUsuario } from "../model/denunciaUsuarioModel.js";

export async function capturarCategoriasDenuncia(req, res) {
    try {
        const categoriasDenuncia = await selectCategoriasDenuncia();

        if (!categoriasDenuncia || categoriasDenuncia.length === 0) {
            return res.status(400).json({ 
                statusCode: 400, 
                message: "Nenhuma categoria de denúncia foi encontrada!" 
            });
        }

        res.status(200).json({
            statusCode: 200, 
            message: "As categorias de denúncia foram capturadas com sucesso!",
            categoriasDenuncia
        });
    } catch (error) {
        res.status(500).json({ 
            statusCode: 500, 
            message: "Erro ao capturar as categorias de denúncia!"
        });
    }
}

export async function verificaExistenciaDenunciaNoticia(req, res) {
  try {
    const { idNoticia, apelido } = req.body;
    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da notícia é obrigatório."
      });
    }
    if (!apelido) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido é obrigatório." 
      });
    }
  
    const noticiaExiste = await verificaNoticia(idNoticia);
    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (noticiaExiste > 0 && usuarioExiste > 0) {
      const existeDenunciaNoticia = await verificaDenunciaNoticia(idNoticia, apelido);
      return res.status(200).json({ existeDenunciaNoticia });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Notícia ou apelido não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao verificar denúncia da notícia!"
    });
  }
}

export async function verificaExistenciaDenunciaComentario(req, res) {
  try {
    const { idComentario, apelido } = req.body;
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID do comentário é obrigatório."
      });
    }
    if (!apelido) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido é obrigatório." 
      });
    }
  
    const comentarioExiste = await verificaComentarioNoticia(idComentario);
    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (comentarioExiste > 0 && usuarioExiste > 0) {
      const existeDenunciaComentario = await verificaDenunciaComentario(idComentario, apelido);
      return res.status(200).json({ existeDenunciaComentario });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Comentário ou apelido não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao verificar denúncia do comentário!"
    });
  }
}

export async function verificaExistenciaDenunciaUsuario(req, res) {
  try {
    const { apelidoDenunciado, apelido } = req.body;
    if (!apelidoDenunciado) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido de quem foi denunciado é obrigatório."
      });
    }
    if (!apelido) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido é obrigatório." 
      });
    }
  
    const usuarioDenunciadoExiste = await verificaApelidoUsuario(apelidoDenunciado);
    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (usuarioDenunciadoExiste > 0 && usuarioExiste > 0) {
      const existeDenunciaUsuario = await verificaDenunciaUsuario(apelidoDenunciado, apelido);
      return res.status(200).json({ existeDenunciaUsuario });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Apelido de quem foi denunciado ou apelido do autor não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao verificar denúncia de usuário!"
    });
  }
}

export async function denunciarComentario(req, res) {
  try {
    const { categoriaDenunciaSelecionada, denuncia, idComentario, apelido } = req.body;
    if (!categoriaDenunciaSelecionada) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Categoria de denúncia é obrigatória." 
      });
    }
    if (!denuncia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Denúncia é obrigatória." 
      });
    }
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID do comentário é obrigatório." 
      });
    }
    if (!apelido) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido é obrigatório." 
      });
    }

    const comentarioNoticiaExiste = await verificaComentarioNoticia(idComentario);
    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (comentarioNoticiaExiste > 0 && usuarioExiste > 0) {
      const resultado = await insertDenunciaComentario(categoriaDenunciaSelecionada, denuncia, idComentario, apelido);

      return res.status(resultado.statusCode).json({
        statusCode: resultado.statusCode,
        message: resultado.message
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Comentário ou apelido não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao denunciar comentário!"
    });
  }
}

export async function denunciarNoticia(req, res) {
  try {
    const { categoriaDenunciaSelecionada, denuncia, idNoticia, apelido } = req.body;
    if (!categoriaDenunciaSelecionada) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Categoria de denúncia é obrigatória." 
      });
    }
    if (!denuncia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Denúncia é obrigatória." 
      });
    }
    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da notícia é obrigatória." 
      });
    }
    if (!apelido) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido é obrigatório." 
      });
    }

    const noticiaExiste = await verificaNoticia(idNoticia);
    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (noticiaExiste > 0 && usuarioExiste > 0) {
      const resultado = await insertDenunciaNoticia(categoriaDenunciaSelecionada, denuncia, idNoticia, apelido);

      return res.status(resultado.statusCode).json({
        statusCode: resultado.statusCode,
        message: resultado.message
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Notícia ou apelido não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao denunciar notícia!"
    });
  }
}

export async function denunciarUsuario(req, res) {
  try {
    const { categoriaDenunciaSelecionada, denuncia, apelidoDenunciado, apelido } = req.body;
    if (!categoriaDenunciaSelecionada) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Categoria de denúncia é obrigatória." 
      });
    }
    if (!denuncia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Denúncia é obrigatória." 
      });
    }
    if (!apelidoDenunciado) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Usuário denunciado é obrigatório." 
      });
    }
    if (!apelido) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido é obrigatório." 
      });
    }

    const usuarioDenunciadoExiste = await verificaApelidoUsuario(apelidoDenunciado);
    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (usuarioDenunciadoExiste > 0 && usuarioExiste > 0) {
      const resultado = await insertDenunciaUsuario(categoriaDenunciaSelecionada, denuncia, apelidoDenunciado, apelido);

      return res.status(resultado.statusCode).json({
        statusCode: resultado.statusCode,
        message: resultado.message
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Apelido do usuário denunciado ou apelido do autor não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao denunciar usuário!"
    });
  }
}