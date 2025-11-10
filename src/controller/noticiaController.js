import { deleteImagensNoticia } from "../model/imagemModel.js";
import { insertNoticia, updateNoticia, deleteNoticia, selectNoticias, selectNoticiasDoUsuario, selectNoticiaPorIdEApelido, verificaNoticia, selectNoticiasPesquisadas, selectNoticiasPesquisadasAdmin, selectNoticiasAdmin, updateDesativarNoticia, updateAtivarNoticia, selectNoticiaAdmin, selectNoticia } from "../model/noticiaModel.js";
import { selectBairros } from "../model/bairroModel.js";
import { insertCurtidaNoticia, deleteCurtidaNoticia, deleteTodasCurtidasNoticia, verificaCurtidaNoticia, contaCurtidasNoticia } from "../model/curtidaNoticiaModel.js";
import { contaComentariosNoticia, selectComentariosAdmin, selectComentariosPesquisadosAdmin } from "../model/comentarioModel.js";
import { verificaApelidoUsuario } from "../model/usuarioModel.js";
import { deleteTodosComentariosPorNoticia, insertComentarioNoticia, selectComentariosPorNoticia, verificaComentarioNoticia, updateComentarioNoticia, deleteComentarioNoticia } from "../model/comentarioModel.js";
import { verificaCurtidaComentarioNoticia, contaCurtidasComentarioNoticia, insertCurtidaComentarioNoticia, deleteCurtidaComentarioNoticia, deleteTodasCurtidasComentarioNoticia, deleteTodasCurtidasComentariosNoticiaPorNoticia } from "../model/curtidaComentarioModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { contaDenunciasComentario, deleteTodasDenunciasComentarioPorId } from "../model/denunciaComentarioModel.js";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Erro: A API KEY do Gemini não está definida. Defina a variável de ambiente GEMINI_API_KEY.");
    // Encerra a aplicação com erro
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analisarDescricao(req, res) {
    try {
        const { descricao } = req.body;
        
        if (!descricao) {
          return res.status(400).json({ 
            statusCode: 400, 
            message: "Nenhuma bairro foi encontrada!" 
          });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = "Analise o seguinte texto: "
             + descricao
             + "\nAgora responda apenas com 'true' ou 'false' para cada uma das perguntas abaixo, e então retorne um único valor final baseado nas seguintes regras lógicas:\n\n"
             + "1. Este texto viola alguma lei, regra ou diretriz de comunidade?\n"
             + "2. Este texto pode ser considerado uma postagem, publicação ou notícia válida? Para ser considerado válido, o texto deve apresentar estrutura mínima, clareza, coesão e transmitir uma informação inteligível e relevante para um leitor comum.\n\n"
             + "Considere inválidos textos incoerentes, sem sentido, excessivamente curtos, compostos por repetições ou que não expressam nenhuma informação identificável. Nestes casos, a resposta da pergunta 2 deve ser 'false'.\n\n"
             + "Regras de decisão:\n"
             + "- Se a resposta para a pergunta 1 for 'true', retorne 'true'.\n"
             + "- Se a resposta para a pergunta 2 for 'false', retorne 'true'.\n"
             + "- Caso contrário, retorne 'false'.\n\n"
             + "Retorne somente o resultado final, sem explicações.";

        const result = await model.generateContent(prompt);

        if (result.response.text().trim() == "true") {
            return res.status(200).json({ 
                statusCode: 200, 
                valido: false,
                message: "A descrição desta notícia é inválida ou viola alguma lei, regra ou diretriz de nossa comunidade. Revise-a e tente novamente."
            });
        } else {
            return res.status(200).json({ 
                statusCode: 200, 
                valido: true, 
                message: "A descrição desta notícia é válida."
            });
        }
    } catch (error) {
        console.log(error.statusCode);
        console.log(error.message);
        
        return res.status(error.statusCode).json({ 
            statusCode: error.statusCode,  
            valido: false,
            message: "Erro ao validar a descrição desta notícia.",
        });
    }
}

export async function analisarImagem(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhuma imagem foi enviada." });
        }

        const buffer = req.file.buffer;
        const base64Data = buffer.toString("base64");
        const mimeType = req.file.mimetype;
        const nome = req.file.originalname;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                        text:
                            "Esta imagem infringe alguma lei ou contém conteúdo impróprio? " +
                            "Responda **apenas** com `true` ou `false`, sem explicações, sem texto adicional."
                        },
                        {
                        inlineData: { mimeType: mimeType, data: base64Data }
                        }
                    ]
                }
            ]
        });

        if (result.response.text().trim() == "true") {
            return res.status(200).json({ 
                statusCode: 200,  
                valido: false,
                message: "A imagem '" + nome + "' viola alguma regra. Revise-a e tente novamente!"
            });
        } else {
            return res.status(200).json({ 
                statusCode: 200,  
                valido: true,
                message: "A imagem '" + nome + "' é válida."
            });
        }
    } catch (error) {
        const nome = req.file.originalname;

        res.status(500).json({ 
            statusCode: 500,  
            valido: false,
            message: "Erro ao validar a imagem: " + nome
        });
    }
}

export async function capturarBairros(req, res) {
    try {
        const bairros = await selectBairros();

        if (!bairros || bairros.length === 0) {
            return res.status(400).json({ 
                statusCode: 400, 
                message: "Nenhum bairro foi encontrado!" 
            });
        }

        res.status(200).json({
            statusCode: 200, 
            message: "Os bairros foram capturados com sucesso!",
            bairros
        });
    } catch (error) {
        res.status(500).json({ 
            statusCode: 500, 
            message: "Erro ao capturar os bairros!"
        });
    }
}

export async function capturarNoticias(req, res) {
    try {
        const pagina = parseInt(req.query.pagina || "1", 10);

        const { noticias, totalNoticias } = await selectNoticias(pagina, 10);

        res.status(200).json({
            statusCode: 200,
            message: "As notícias foram capturadas com sucesso!",
            noticias,
            totalNoticias
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Erro ao capturar as notícias."
        });
    }
}

export async function capturarNoticiasDoUsuario(req, res) {
    try {
        const { apelido } = req.params;
        const pagina = parseInt(req.query.pagina || "1", 10);

        if (!apelido) {
            return res.status(400).json({
                statusCode: 400,
                message: "Parâmetro 'apelido' é obrigatório."
            });
        }

        const { noticias, totalNoticias } = await selectNoticiasDoUsuario(apelido, pagina, 10);

        res.status(200).json({
            statusCode: 200,
            message: "As notícias foram capturadas com sucesso!",
            noticias,
            totalNoticias
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Erro ao capturar as notícias."
        });
    }
}

export async function capturarNoticiaDoUsuario(req, res) {
  try {
    const apelido = req.session.user.apelido;
    const idNoticia = req.params.idNoticia;

    if (!apelido) {
      return res.status(401).json({
        statusCode: 401,
        message: "Usuário não autenticado."
      });
    }

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "O ID da notícia é obrigatório."
      });
    }

    const noticia = await selectNoticiaPorIdEApelido(idNoticia, apelido);
    if (!noticia) {
      return res.status(404).json({
        statusCode: 404,
        message: "Notícia não encontrada!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Notícia capturada com sucesso!",
      noticia,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar notícia!"
    });
  }
}

export async function cadastro(req, res) {
    try {
        const resultado = await insertNoticia(req.body);

        res.status(resultado.statusCode).json({
            idNoticia: resultado.idNoticia,
            statusCode: resultado.statusCode,
            message: resultado.message
        });
    } catch (error) {
        res.status(500).json({ 
            statusCode: 500, 
            message: "Erro ao cadastrar notícia!"
        });
    }
}

export async function editarNoticia(req, res) {
    try {
        const noticia = req.body;
        if (!noticia) {
          return res.status(400).json({
            statusCode: 400,
            message: "Notícia é obrigatória."
          });
        }
        
        const noticiaExiste = await verificaNoticia(noticia.idNoticia);
        if (noticiaExiste > 0) {
          await deleteImagensNoticia(noticia.idNoticia);

          const resultado = await updateNoticia(noticia);

          res.status(resultado.statusCode).json({
              statusCode: resultado.statusCode,
              message: resultado.message
          });
        } else {
          return res.status(404).json({
            statusCode: 404,
            message: "A notícia não foi encontrada!"
          });
        }
    } catch (error) {
        res.status(500).json({ 
            statusCode: 500, 
            message: "Erro ao atualizar notícia!"
        });
    }
}

export async function apagarNoticia(req, res) {
  try {
    const { idNoticia } = req.body;
    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da notícia é obrigatório." 
      });
    }

    const noticiaExiste = await verificaNoticia(idNoticia);
    if (noticiaExiste > 0) {
      await deleteImagensNoticia(idNoticia);
      await deleteTodasCurtidasNoticia(idNoticia);
      await deleteTodasCurtidasComentariosNoticiaPorNoticia(idNoticia);
      await deleteTodosComentariosPorNoticia(idNoticia);
      const resultado = await deleteNoticia(idNoticia);

      res.status(resultado.statusCode).json({
        statusCode: resultado.statusCode,
        message: resultado.message
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "A notícia não foi encontrada!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao apagar notícia!"
    });
  }
}

export async function curtirNoticia(req, res) {
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
            const resultado = await insertCurtidaNoticia(idNoticia, apelido);

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
            message: "Erro ao curtir notícia!"
        });
    }
}

export async function removerCurtidaNoticia(req, res) {
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
      await deleteCurtidaNoticia(idNoticia, apelido);

      return res.status(200).json({
        statusCode: 200,
        message: "Curtida da notícia removida com sucesso!"
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
      message: "Erro ao remover curtida da notícia!"
    });
  }
}

export async function verificaExistenciaCurtidaNoticia(req, res) {
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
      const existeCurtidaNoticia = await verificaCurtidaNoticia(idNoticia, apelido);
      return res.status(200).json({ existeCurtidaNoticia });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Notícia ou apelido não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao verificar curtida da notícia!"
    });
  }
}

export async function contarCurtidasNoticia(req, res) {
  try {
    const { idNoticia } = req.body;
    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da notícia é obrigatório.",
        quantidadeCurtidasNoticia: 0
      });
    }

    const noticiaExiste = await verificaNoticia(idNoticia);
    if (noticiaExiste > 0) {
      const quantidadeCurtidasNoticia = await contaCurtidasNoticia(idNoticia);
      return res.status(quantidadeCurtidasNoticia.statusCode).json(quantidadeCurtidasNoticia);
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Notícia não encontrada!",
        quantidadeCurtidasNoticia: 0
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao contar a quantidade de curtidas da notícia!",
      quantidadeCurtidasNoticia: 0
    });
  }
}

export async function contarComentariosNoticia(req, res) {
  try {
    const { idNoticia } = req.body;
    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da notícia é obrigatório.",
        quantidadeComentariosNoticia: 0
      });
    }

    const noticiaExiste = await verificaNoticia(idNoticia);
    if (noticiaExiste > 0) {
      let apelido = "";
      if (req.session && req.session.user) {
        apelido = req.session.user.apelido;
      }

      const quantidadeComentariosNoticia = await contaComentariosNoticia(idNoticia, apelido);
      return res.status(quantidadeComentariosNoticia.statusCode).json(quantidadeComentariosNoticia);
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Notícia não encontrada!",
        quantidadeComentariosNoticia: 0
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao contar a quantidade de comentários da notícia!",
      quantidadeComentariosNoticia: 0
    });
  }
}

export async function comentarNoticia(req, res) {
    try {
        const { comentario, idNoticia, apelido } = req.body;
        if (!comentario) {
            return res.status(400).json({ 
                statusCode: 400, 
                message: "Comentário é obrigatório." 
            });
        }
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
            const resultado = await insertComentarioNoticia(comentario, idNoticia, apelido);

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
            message: "Erro ao comentar notícia!"
        });
    }
}

export async function capturarComentariosNoticia(req, res) {
  try {
    const { idNoticia, paginaComentarios } = req.params;
    const paginaNum = Math.max(1, parseInt(paginaComentarios || "1", 10));
    const limite = 10; //quantidade de comentários por página

    let apelido = "";
    if (req.session && req.session.user) {
      apelido = req.session.user.apelido;
    }

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "ID notícia é obrigatório."
      });
    }

    const { comentarios } = await selectComentariosPorNoticia(idNoticia, paginaNum, limite, apelido);

    res.status(200).json({
      statusCode: 200,
      message: "Os comentários foram capturados com sucesso!",
      comentarios
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar os comentários!",
      comentarios: []
    });
  }
}

export async function verificaExistenciaCurtidaComentarioNoticia(req, res) {
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
      const existeCurtidaComentarioNoticia = await verificaCurtidaComentarioNoticia(idComentario, apelido);
      return res.status(200).json({ existeCurtidaComentarioNoticia });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Comentário ou apelido não encontrados!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao verificar curtida do comentário da notícia!"
    });
  }
}

export async function contarCurtidasComentarioNoticia(req, res) {
  try {
    const { idComentario } = req.body;
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID do comentário da notícia é obrigatório.",
        quantidadeCurtidasComentarioNoticia: 0
      });
    }

    const comentarioExiste = await verificaComentarioNoticia(idComentario);
    if (comentarioExiste > 0) {
      const quantidadeCurtidasComentarioNoticia = await contaCurtidasComentarioNoticia(idComentario);
      return res.status(quantidadeCurtidasComentarioNoticia.statusCode).json(quantidadeCurtidasComentarioNoticia);
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Comentário não encontrado!",
        quantidadeCurtidasComentarioNoticia: 0
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao contar a quantidade de curtidas do comentário da notícia!",
      quantidadeCurtidasComentarioNoticia: 0
    });
  }
}

export async function curtirComentarioNoticia(req, res) {
  try {
    const { idComentario, apelido } = req.body;
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID do comentário da notícia é obrigatório." 
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
      const resultado = await insertCurtidaComentarioNoticia(idComentario, apelido);

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
      message: "Erro ao curtir comentário da notícia!"
    });
  }
}

export async function removerCurtidaComentarioNoticia(req, res) {
  try {
    const { idComentario, apelido } = req.body;
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID do comentário da notícia é obrigatório." 
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
      await deleteCurtidaComentarioNoticia(idComentario, apelido);

      return res.status(200).json({
        statusCode: 200,
        message: "Curtida do comentário da notícia removida com sucesso!"
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
      message: "Erro ao remover curtida do comentário da notícia!"
    });
  }
}

export async function editarComentarioNoticia(req, res) {
    try {
        const { comentarioEditado, idComentario } = req.body;

        if (!comentarioEditado) {
          return res.status(400).json({ 
            statusCode: 400, 
            message: "Comentário editado é obrigatório." 
          });
        }
        if (!idComentario) {
          return res.status(400).json({ 
            statusCode: 400, 
            message: "ID do comentário da notícia é obrigatório." 
          });
        }
        
        const comentarioExiste = await verificaComentarioNoticia(idComentario);
        if (comentarioExiste > 0) {
          const resultado = await updateComentarioNoticia(comentarioEditado, idComentario);

          res.status(resultado.statusCode).json({
              statusCode: resultado.statusCode,
              message: resultado.message
          });
        } else {
          return res.status(404).json({
            statusCode: 404,
            message: "O comentário da notícia não foi encontrado!"
          });
        }
    } catch (error) {
        res.status(500).json({ 
            statusCode: 500, 
            message: "Erro ao atualizar comentário da notícia!"
        });
    }
}

export async function apagarComentarioNoticia(req, res) {
  try {
    const { idComentario } = req.body;
    if (!idComentario) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID do comentário da notícia é obrigatório." 
      });
    }

    const comentarioExiste = await verificaComentarioNoticia(idComentario);

    if (comentarioExiste > 0) {
      await deleteTodasCurtidasComentarioNoticia(idComentario);
      await deleteTodasDenunciasComentarioPorId(idComentario);
      await deleteComentarioNoticia(idComentario);

      return res.status(200).json({
        statusCode: 200,
        message: "O comentário da notícia foi deletado com sucesso!"
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "O comentário da notícia não foi encontrado!"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao apagar comentário da notícia!"
    });
  }
}

export async function pesquisarNoticias(req, res) {
  try {
    const pagina = parseInt(req.query.pagina || "1", 10);
    const busca = req.query.busca;

    const { noticias, totalNoticias } = await selectNoticiasPesquisadas(busca, pagina, 10);

    res.status(200).json({
      statusCode: 200,
      message: "As notícias foram pesquisadas com sucesso!",
      noticias,
      totalNoticias
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao pesquisar as notícias."
    });
  }
}

export async function capturarNoticiasAdmin(req, res) {
  try {
    const pagina = parseInt(req.query.pagina || "1", 10);

    const { noticias, totalNoticias } = await selectNoticiasAdmin(pagina, 10);

    res.status(200).json({
      statusCode: 200,
      message: "As notícias foram capturadas com sucesso!",
      noticias,
      totalNoticias
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar as notícias.",
      noticias: [],
      totalNoticias: 0
    });
  }
}

export async function pesquisarNoticiasAdmin(req, res) {
  try {
    const pagina = parseInt(req.query.pagina || "1", 10);
    const busca = req.query.busca;

    const { noticias, totalNoticias } = await selectNoticiasPesquisadasAdmin(busca, pagina, 10);

    res.status(200).json({
      statusCode: 200,
      message: "As notícias foram pesquisadas com sucesso!",
      noticias,
      totalNoticias
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao pesquisar as notícias."
    });
  }
}

export async function desativarNoticiaAdmin(req, res) {
  try {
    const { idNoticia } = req.body;

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "ID da notícia é obrigatório!"
      });
    }

    // Desativa a notícia do usuário
    await updateDesativarNoticia(idNoticia);

    return res.status(200).json({
      statusCode: 200,
      message: "Notícia desativada com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao desativar notícia:", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao desativar notícia!"
    });
  }
}

export async function ativarNoticiaAdmin(req, res) {
  try {
    const { idNoticia } = req.body;

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "ID da notícia é obrigatório!"
      });
    }

    // Ativa a notícia do usuário
    await updateAtivarNoticia(idNoticia);
    
    return res.status(200).json({
      statusCode: 200,
      message: "Notícia ativada com sucesso!"
    });

  } catch (error) {
    console.error("Erro ao ativar notícia:", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao ativar notícia!"
    });
  }
}

export async function contarDenunciasComentario(req, res) {
  try {
    const { idComentario } = req.params;

    if (!idComentario) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetro idComentario é obrigatório.",
        quantidadeDenunciasComentario: 0
      });
    }

    const comentarioExiste = await verificaComentarioNoticia(idComentario);
    if (comentarioExiste > 0) {
      const quantidadeDenunciasComentario = await contaDenunciasComentario(idComentario);
      return res.status(quantidadeDenunciasComentario.statusCode).json(quantidadeDenunciasComentario);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O idComentario fornecido não é válido!",
        quantidadeDenunciasComentario: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de denúncias do comentário!",
      quantidadeDenunciasComentario: 0
    });
  }
}

export async function capturarComentariosAdmin(req, res) {
  try {
    const pagina = parseInt(req.query.pagina || "1", 10);

    const { comentarios, totalComentarios } = await selectComentariosAdmin(pagina, 10);

    res.status(200).json({
      statusCode: 200,
      message: "Os comentários foram capturados com sucesso!",
      comentarios,
      totalComentarios
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar os comentários.",
      comentarios: [],
      totalComentarios: 0
    });
  }
}

export async function pesquisarComentariosAdmin(req, res) {
  try {
    const pagina = parseInt(req.query.pagina || "1", 10);
    const busca = req.query.busca;

    const { comentarios, totalComentarios } = await selectComentariosPesquisadosAdmin(busca, pagina, 10);

    res.status(200).json({
      statusCode: 200,
      message: "Os comentários foram pesquisadas com sucesso!",
      comentarios,
      totalComentarios
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao pesquisar as comentários."
    });
  }
}

export async function capturarNoticiaAdmin(req, res) {
  try {
    const idNoticia = req.query.idNoticia;

    if (!idNoticia) {
      return res.status(400).json({
        statusCode: 400,
        message: "O ID da notícia é obrigatório.",
        noticia: null
      });
    }
    
    const noticia = await selectNoticiaAdmin(idNoticia);

    res.status(200).json({
      statusCode: 200,
      message: "A notícia foi capturada com sucesso!",
      noticia: noticia
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Erro ao capturar a notícia.",
      noticia: null
    });
  }
}

export async function capturarNoticia(req, res) {
  try {
    const { apelidoAutor, idNoticia } = req.body;
    if (!apelidoAutor) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "Apelido do autor é obrigatório.",
        noticia: null
      });
    }

    if (!idNoticia) {
      return res.status(400).json({ 
        statusCode: 400, 
        message: "ID da notícia é obrigatório.",
        noticia: null
      });
    }

    const usuarioExiste = await verificaApelidoUsuario(apelidoAutor);
    const noticiaExiste = await verificaNoticia(idNoticia);

    if (noticiaExiste > 0 && usuarioExiste.existe > 0 && usuarioExiste.admin == 0) {
      const noticia = await selectNoticia(idNoticia, apelidoAutor);

      res.status(200).json({
        statusCode: 200,
        message: "A notícia foi capturada com sucesso!",
        noticia: noticia
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Apelido do autor ou notícia não encontrados!",
        noticia: null
      });
    }
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao capturar notícia!",
      noticia: null
    });
  }
}