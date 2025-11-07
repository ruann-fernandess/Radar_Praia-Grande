import { selectCategoriasDenuncia } from "../model/categoriaDenunciaModel.js";
import { deleteNoticiasUsuario, verificaNoticia, selectIdsNoticiasPorApelido, updateDesativarNoticia, updateAtivarNoticia, updateStatusNoticia } from "../model/noticiaModel.js";
import { deleteComentarioNoticia, deleteComentariosNoticiaPorAutorDaNoticia, deleteTodosComentariosPorApelido, verificaComentarioNoticia } from "../model/comentarioModel.js";
import { deleteUsuario, updateAtivarUsuario, updateDesativarUsuario, verificaApelidoUsuario } from "../model/usuarioModel.js";
import { verificaDenunciaNoticia, insertDenunciaNoticia, contaDenunciasNoticiaAprovadas, contaDenunciasNoticiaPendentes, contaDenunciasNoticia, updateAprovarDenunciaNoticia, deleteDenunciaNoticia, selectDenunciasNoticiaAdmin, verificaDenunciaNoticiaPorId } from "../model/denunciaNoticiaModel.js";
import { verificaDenunciaComentario, insertDenunciaComentario, contaDenunciasComentarioPendentes, selectDenunciasComentarioAdmin, deleteDenunciaComentario, updateAprovarDenunciaComentario, verificaDenunciaComentarioPorId, deleteTodasDenunciasComentarioPorId } from "../model/denunciaComentarioModel.js";
import { verificaDenunciaUsuario, insertDenunciaUsuario, contaDenunciasUsuario, contaDenunciasUsuarioAprovadas, contaDenunciasUsuarioPendentes, selectDenunciasUsuarioAdmin, verificaDenunciaUsuarioPorId, updateAprovarDenunciaUsuario, deleteDenunciaUsuario, deleteTodasDenunciasUsuarioPorApelido } from "../model/denunciaUsuarioModel.js";
import { deleteTodasAmizadesPorApelido } from "../model/amizadeModel.js";
import { deleteTodasCurtidasNoticiaPorApelido } from "../model/curtidaNoticiaModel.js";
import { deleteCurtidasComentariosNoticiaPorAutorDaNoticia, deleteTodasCurtidasComentarioNoticia, deleteTodasCurtidasComentarioNoticiaPorApelido } from "../model/curtidaComentarioModel.js";
import { deleteImagensUsuario } from "../model/imagemModel.js";
import { apagarComentarioNoticia } from "./noticiaController.js";

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
    if (noticiaExiste > 0 && usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
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
    if (comentarioExiste > 0 && usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
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
    if (usuarioDenunciadoExiste.existe > 0 && usuarioDenunciadoExiste.admin == 0 && usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
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
    if (comentarioNoticiaExiste > 0 && usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
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
    if (noticiaExiste > 0 && usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
      const resultado = await insertDenunciaNoticia(categoriaDenunciaSelecionada, denuncia, idNoticia, apelido);

      if (resultado.statusCode == 200) {
        await updateStatusNoticia(idNoticia, "Aguardando revisão dos administradores");
      }

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
    if (usuarioDenunciadoExiste.existe > 0 && usuarioDenunciadoExiste.admin == 0 && usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
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

export async function contarDenunciasUsuarioAprovadas(req, res) {
  try {
    const { apelido } = req.params;

    if (!apelido) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido é obrigatório.",
        quantidadeDenunciasUsuarioAprovadas: 0
      });
    }

    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
      const quantidadeDenunciasUsuarioAprovadas = await contaDenunciasUsuarioAprovadas(apelido);
      return res.status(quantidadeDenunciasUsuarioAprovadas.statusCode).json(quantidadeDenunciasUsuarioAprovadas);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O usuário fornecido não é válido!",
        quantidadeDenunciasUsuarioAprovadas: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias aprovadas do usuário!",
      quantidadeDenunciasUsuarioAprovadas: 0
    });
  }
}

export async function contarDenunciasUsuarioPendentes(req, res) {
  try {
    const { apelido } = req.params;

    if (!apelido) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido é obrigatório.",
        quantidadeDenunciasUsuarioPendentes: 0
      });
    }

    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
      const quantidadeDenunciasUsuarioPendentes = await contaDenunciasUsuarioPendentes(apelido);
      return res.status(quantidadeDenunciasUsuarioPendentes.statusCode).json(quantidadeDenunciasUsuarioPendentes);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O usuário fornecido não é válido!",
        quantidadeDenunciasUsuarioPendentes: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias pendentes do usuário!",
      quantidadeDenunciasUsuarioPendentes: 0
    });
  }
}

export async function contarDenunciasUsuario(req, res) {
  try {
    const { apelido } = req.params;

    if (!apelido) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido é obrigatório.",
        quantidadeDenunciasUsuario: 0
      });
    }

    const usuarioExiste = await verificaApelidoUsuario(apelido);
    if (usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
      const quantidadeDenunciasUsuario = await contaDenunciasUsuario(apelido);
      return res.status(quantidadeDenunciasUsuario.statusCode).json(quantidadeDenunciasUsuario);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O usuário fornecido não é válido!",
        quantidadeDenunciasUsuario: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias do usuário!",
      quantidadeDenunciasUsuario: 0
    });
  }
}

export async function capturarDenunciasUsuario(req, res) {
  try {
    const { apelido, paginaDenunciasUsuario } = req.params;
    const paginaNum = Math.max(1, parseInt(paginaDenunciasUsuario || "1", 10));
    const limite = 10; //quantidade de denúncias por página

    if (!apelido) {
      return res.status(400).json({
        statusCode: 400,
        message: "Apelido é obrigatório."
      });
    }

    const { denuncias } = await selectDenunciasUsuarioAdmin(apelido, paginaNum, limite);

    res.status(200).json({
      statusCode: 200,
      message: "As denúncias foram capturadas com sucesso!",
      denuncias
    });
  } catch (error) {
    console.log(error.statusCode);
    console.log(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar as denúncias!",
      denuncias: []
    });
  }
}

export async function aprovarDenunciaUsuario(req, res) {
  try {
    const { idDenunciaUsuario, apelidoAdmin, apelidoDenunciado } = req.body;
    if (!idDenunciaUsuario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da denúncia usuário é obrigatório." 
      });
    }
    if (!apelidoAdmin) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido admin é obrigatório." 
      });
    }
    if (!apelidoDenunciado) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido do denunciado é obrigatório." 
      });
    }

    const denunciaUsuarioExiste = await verificaDenunciaUsuarioPorId(idDenunciaUsuario);
    const usuarioAdminExiste = await verificaApelidoUsuario(apelidoAdmin);
    let quantidadeDenunciasUsuarioAprovadas = 0;

    if (denunciaUsuarioExiste > 0 && usuarioAdminExiste.existe > 0 && usuarioAdminExiste.admin == 1) {
      const resultado = await updateAprovarDenunciaUsuario(idDenunciaUsuario, apelidoAdmin);
      quantidadeDenunciasUsuarioAprovadas = (await contaDenunciasUsuarioAprovadas(apelidoDenunciado)).quantidadeDenunciasUsuarioAprovadas;

      if (quantidadeDenunciasUsuarioAprovadas >= 3) {
        // Desativa todas as notícias do usuário
        const arrayIdsNoticias = await selectIdsNoticiasPorApelido(apelidoDenunciado);
        for (let i = 0; i < arrayIdsNoticias.length; i++) {
          await updateDesativarNoticia(arrayIdsNoticias[i]);
        }
        
        await updateDesativarUsuario(apelidoDenunciado);
      }

      return res.status(resultado.statusCode).json({
        statusCode: resultado.statusCode,
        message: resultado.message,
        quantidadeDenunciasUsuarioAprovadas: quantidadeDenunciasUsuarioAprovadas
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "ID da denúncia usuário ou apelido admin não encontrados!",
        quantidadeDenunciasUsuarioAprovadas: quantidadeDenunciasUsuarioAprovadas
      });
    }
  } catch (error) {
    console.log(error.statusCode);
    console.log(error.message);
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao aprovar denúncia usuário!",
      quantidadeDenunciasUsuarioAprovadas: 0
    });
  }
}

export async function ignorarDenunciaUsuario(req, res) {
  try {
    const { idDenunciaUsuario, apelidoDenunciado } = req.body;
    if (!idDenunciaUsuario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da denúncia usuário é obrigatório." 
      });
    }
    if (!apelidoDenunciado) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido do usuário denunciado é obrigatório." 
      });
    }

    const denunciaUsuarioExiste = await verificaDenunciaUsuarioPorId(idDenunciaUsuario);
    if (denunciaUsuarioExiste > 0) {
      const quantidadeDenunciasUsuarioAprovadas = await contaDenunciasUsuarioAprovadas(apelidoDenunciado);
      await deleteDenunciaUsuario(idDenunciaUsuario);
        
      if (quantidadeDenunciasUsuarioAprovadas.quantidadeDenunciasUsuarioAprovadas == 3) {
        // Ativa todas as notícias do usuário
        const arrayIdsNoticias = await selectIdsNoticiasPorApelido(apelidoDenunciado);
        for (let i = 0; i < arrayIdsNoticias.length; i++) {
          await updateAtivarNoticia(arrayIdsNoticias[i]);
        }
        
        await updateAtivarUsuario(apelidoDenunciado);
      }

      res.status(200).json({
        statusCode: 200,
        message: "A denúncia usuário foi deletada com sucesso!"
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "ID da denúncia usuário não encontrado!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao ignorar denúncia usuário!"
    });
  }
}

export async function contarDenunciasNoticiaAprovadas(req, res) {
  try {
    const { idNoticia } = req.params;

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetro idNotícia é obrigatório.",
        quantidadeDenunciasNoticiaAprovadas: 0
      });
    }

    const noticiaExiste = await verificaNoticia(idNoticia);
    if (noticiaExiste > 0) {
      const quantidadeDenunciasNoticiaAprovadas = await contaDenunciasNoticiaAprovadas(idNoticia);
      return res.status(quantidadeDenunciasNoticiaAprovadas.statusCode).json(quantidadeDenunciasNoticiaAprovadas);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O idNotiicia fornecido não é válido!",
        quantidadeDenunciasNoticiaAprovadas: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias aprovadas da notícia!",
      quantidadeDenunciasNoticiaAprovadas: 0
    });
  }
}

export async function contarDenunciasNoticiaPendentes(req, res) {
  try {
    const { idNoticia } = req.params;

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetro idNoticia é obrigatório.",
        quantidadeDenunciasNoticiaPendentes: 0
      });
    }

    const noticiaExiste = await verificaNoticia(idNoticia);
    if (noticiaExiste > 0) {
      const quantidadeDenunciasNoticiaPendentes = await contaDenunciasNoticiaPendentes(idNoticia);
      return res.status(quantidadeDenunciasNoticiaPendentes.statusCode).json(quantidadeDenunciasNoticiaPendentes);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O idNoticia fornecido não é válido!",
        quantidadeDenunciasNoticiaPendentes: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias pendentes da notícia!",
      quantidadeDenunciasNoticiaPendentes: 0
    });
  }
}

export async function contarDenunciasNoticia(req, res) {
  try {
    const { idNoticia } = req.params;

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetro idNoticia é obrigatório.",
        quantidadeDenunciasNoticia: 0
      });
    }

    const noticiaExiste = await verificaNoticia(idNoticia);
    if (noticiaExiste > 0) {
      const quantidadeDenunciasNoticia = await contaDenunciasNoticia(idNoticia);
      return res.status(quantidadeDenunciasNoticia.statusCode).json(quantidadeDenunciasNoticia);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O idNoticia fornecido não é válido!",
        quantidadeDenunciasNoticia: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias do usuário!",
      quantidadeDenunciasNoticia: 0
    });
  }
}

export async function capturarDenunciasNoticia(req, res) {
  try {
    const { idNoticia, paginaDenunciasNoticia } = req.params;
    const paginaNum = Math.max(1, parseInt(paginaDenunciasNoticia || "1", 10));
    const limite = 10; //quantidade de denúncias por página

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "idNoticia é obrigatório."
      });
    }

    const { denuncias } = await selectDenunciasNoticiaAdmin(idNoticia, paginaNum, limite);

    res.status(200).json({
      statusCode: 200,
      message: "As denúncias foram capturadas com sucesso!",
      denuncias
    });
  } catch (error) {
    console.log(error.statusCode);
    console.log(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar as denúncias!",
      denuncias: []
    });
  }
}

export async function contarDenunciasComentarioPendentes(req, res) {
  try {
    const { idComentario } = req.params;

    if (!idComentario) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetro idComentario é obrigatório.",
        quantidadeDenunciasComentarioPendentes: 0
      });
    }

    const comentarioExiste = await verificaComentarioNoticia(idComentario);
    if (comentarioExiste > 0) {
      const quantidadeDenunciasComentarioPendentes = await contaDenunciasComentarioPendentes(idComentario);
      return res.status(quantidadeDenunciasComentarioPendentes.statusCode).json(quantidadeDenunciasComentarioPendentes);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O idComentario fornecido não é válido!",
        quantidadeDenunciasComentarioPendentes: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias pendentes do comentário!",
      quantidadeDenunciasComentarioPendentes: 0
    });
  }
}

export async function capturarDenunciasComentario(req, res) {
  try {
    const { idComentario, paginaDenunciasComentario } = req.params;
    const paginaNum = Math.max(1, parseInt(paginaDenunciasComentario || "1", 10));
    const limite = 10; //quantidade de denúncias por página

    if (!idComentario) {
      return res.status(400).json({
        statusCode: 400,
        message: "idComentario é obrigatório."
      });
    }

    const { denuncias } = await selectDenunciasComentarioAdmin(idComentario, paginaNum, limite);

    res.status(200).json({
      statusCode: 200,
      message: "As denúncias foram capturadas com sucesso!",
      denuncias
    });
  } catch (error) {
    console.log(error.statusCode);
    console.log(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar as denúncias!",
      denuncias: []
    });
  }
}

export async function aprovarDenunciaNoticia(req, res) {
  try {
    const { idDenunciaNoticia, apelidoAdmin, idNoticia } = req.body;
    if (!idDenunciaNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da denúncia notícia é obrigatório." 
      });
    }
    if (!apelidoAdmin) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido admin é obrigatório." 
      });
    }
    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "idNoticia é obrigatório." 
      });
    }

    const denunciaNoticiaExiste = await verificaDenunciaNoticiaPorId(idDenunciaNoticia);
    const usuarioAdminExiste = await verificaApelidoUsuario(apelidoAdmin);
    let quantidadeDenunciasNoticiaAprovadas = 0;

    if (denunciaNoticiaExiste > 0 && usuarioAdminExiste.existe > 0 && usuarioAdminExiste.admin == 1) {
      const resultado = await updateAprovarDenunciaNoticia(idDenunciaNoticia, apelidoAdmin);
      quantidadeDenunciasNoticiaAprovadas = (await contaDenunciasNoticiaAprovadas(idNoticia)).quantidadeDenunciasNoticiaAprovadas;

      // Desativa a notícia do usuário
      await updateDesativarNoticia(idNoticia);

      return res.status(resultado.statusCode).json({
        statusCode: resultado.statusCode,
        message: resultado.message,
        quantidadeDenunciasNoticiaAprovadas: quantidadeDenunciasNoticiaAprovadas
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "ID da denúncia notícia ou apelido admin não encontrados!",
        quantidadeDenunciasNoticiaAprovadas: quantidadeDenunciasNoticiaAprovadas
      });
    }
  } catch (error) {
    console.log(error.statusCode);
    console.log(error.message);
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao aprovar denúncia notícia!",
      quantidadeDenunciasNoticiaAprovadas: 0
    });
  }
}

export async function ignorarDenunciaNoticia(req, res) {
  try {
    const { idDenunciaNoticia, idNoticia } = req.body;
    if (!idDenunciaNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da denúncia notícia é obrigatório." 
      });
    }
    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da notícia denunciada é obrigatório." 
      });
    }

    const denunciaNoticiaExiste = await verificaDenunciaNoticiaPorId(idDenunciaNoticia);
    if (denunciaNoticiaExiste > 0) {
      await deleteDenunciaNoticia(idDenunciaNoticia);
      
      const quantidadeDenunciasNoticiaAprovadas = await contaDenunciasNoticiaAprovadas(idNoticia);
      const quantidadeDenunciasNoticiaPendentes = await contaDenunciasNoticiaPendentes(idNoticia);

      if (quantidadeDenunciasNoticiaAprovadas.quantidadeDenunciasNoticiaAprovadas == 0 && quantidadeDenunciasNoticiaPendentes.quantidadeDenunciasNoticiaPendentes == 0) {
        // Ativa a notícia do usuário
        await updateAtivarNoticia(idNoticia);
        await updateStatusNoticia(idNoticia, "Revisada por administradores");
      } else if (quantidadeDenunciasNoticiaPendentes.quantidadeDenunciasNoticiaPendentes > 0) {
        await updateStatusNoticia(idNoticia, "Aguardando revisão dos administradores");
      }

      res.status(200).json({
        statusCode: 200,
        message: "A denúncia notícia foi deletada com sucesso!"
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "ID da denúncia notícia não encontrado!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao ignorar denúncia notícia!"
    });
  }
}

export async function aprovarDenunciaComentario(req, res) {
  try {
    const { idDenunciaComentario, apelidoAdmin, idComentario } = req.body;
    if (!idDenunciaComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da denúncia comentário é obrigatório." 
      });
    }
    if (!apelidoAdmin) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido admin é obrigatório." 
      });
    }
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "idComentario é obrigatório." 
      });
    }

    const comentarioExiste = await verificaComentarioNoticia(idComentario);
    const denunciaComentarioExiste = await verificaDenunciaComentarioPorId(idDenunciaComentario);
    const usuarioAdminExiste = await verificaApelidoUsuario(apelidoAdmin);
    
    if (comentarioExiste > 0 && denunciaComentarioExiste > 0 && usuarioAdminExiste.existe > 0 && usuarioAdminExiste.admin == 1) {
      const resultado = await updateAprovarDenunciaComentario(idDenunciaComentario, apelidoAdmin);
      
      // Apaga o comentário do usuário
      await deleteTodasCurtidasComentarioNoticia(idComentario);
      await deleteTodasDenunciasComentarioPorId(idComentario);
      await deleteComentarioNoticia(idComentario);

      return res.status(resultado.statusCode).json({
        statusCode: resultado.statusCode,
        message: resultado.message,
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "ID da denúncia comentário ou apelido admin não encontrados!",
      });
    }
  } catch (error) {
    console.log(error)
    console.log(error.statusCode);
    console.log(error.message);
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao aprovar denúncia comentário!",
    });
  }
}

export async function ignorarDenunciaComentario(req, res) {
  try {
    const { idDenunciaComentario, idComentario } = req.body;
    if (!idDenunciaComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da denúncia comentário é obrigatório." 
      });
    }
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID do comentário denunciado é obrigatório." 
      });
    }

    const denunciaComentarioExiste = await verificaDenunciaComentarioPorId(idDenunciaComentario);
    if (denunciaComentarioExiste > 0) {
      await deleteDenunciaComentario(idDenunciaComentario);

      res.status(200).json({
        statusCode: 200,
        message: "A denúncia comentário foi deletada com sucesso!"
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "ID da denúncia comentário não encontrado!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao ignorar denúncia comentário!"
    });
  }
}