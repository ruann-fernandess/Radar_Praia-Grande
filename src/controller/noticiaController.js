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
        
        const prompt = "Análise o seguinte texto: "
                     + descricao
                     + "Agora responda: este texto viola de alguma forma uma lei, regra ou diretriz de comunidade? Responda com 'true' ou 'false'.";

        const result = await model.generateContent(prompt);

        if (result.response.text().trim() == "true") {
            return res.status(400).json({ 
                statusCode: 400, 
                message: "❌ A descrição desta notícia viola alguma lei, regra ou diretriz de nossa comunidade. Revise-a e tente novamente."
            });
        } else {
            return res.status(200).json({ 
                statusCode: 200, 
                message: "✅ A descrição desta notícia é válida."
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            statusCode: 500, 
            message: "❌ Erro ao validar a descrição desta notícia: " + error.message
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
                        { text: "Esta imagem infringe alguma lei ou contém conteúdo impróprio? Responda com 'true' ou 'false'." },
                        { inlineData: { mimeType: mimeType, data: base64Data } }
                    ]
                }
            ]
        });

        if (result.response.text().trim() == "true") {
            return res.status(400).json({ 
                statusCode: 400, 
                message: "❌ A imagem '" + nome + "' viola alguma regra. Revise-a e tente novamente."
            });
        } else {
            return res.status(200).json({ 
                statusCode: 200, 
                message: "✅ A imagem '" + nome + "' é válida."
            });
        }
    } catch (error) {
        const nome = req.file.originalname;

        res.status(500).json({ 
            statusCode: 500, 
            message: "❌ Erro ao validar a imagem '" + nome + "' - " + error.message
        });
    }
}


{error: "Nenhuma imagem foi enviada."}
error
: 
"Nenhuma imagem foi enviada."