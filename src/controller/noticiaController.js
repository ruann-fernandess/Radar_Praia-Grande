import { deleteImagensNoticia } from "../model/imagemModel.js";
import { insertNoticia, updateNoticia, deleteNoticia, selectNoticias, selectNoticiasDoUsuario, selectNoticiaPorIdEApelido } from "../model/noticiaModel.js";
import { selectBairros } from "../model/bairroModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
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
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
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
        return res.status(500).json({ 
            statusCode: 500,  
            valido: false,
            message: "Erro ao validar a descrição desta notícia."
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

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        message: "Usuário não autenticado.",
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
        await deleteImagensNoticia(noticia.idNoticia);
        
        const resultado = await updateNoticia(noticia);

        res.status(resultado.statusCode).json({
            statusCode: resultado.statusCode,
            message: resultado.message
        });
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

    await deleteImagensNoticia(idNoticia);
    const resultado = await deleteNoticia(idNoticia);

    res.status(resultado.statusCode).json({
      statusCode: resultado.statusCode,
      message: resultado.message
    });
  } catch (error) {
    res.status(500).json({ 
      statusCode: 500, 
      message: "Erro ao apagar notícia!"
    });
  }
}
