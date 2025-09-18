import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableCategoriaDenuncia() {
  try {
    // Cria a tabela se não existir
    await db.exec(`
      CREATE TABLE IF NOT EXISTS CATEGORIA_DENUNCIA (
        idCategoriaDenuncia INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria VARCHAR(80) NOT NULL
      );
    `);

    // Lista de categorias aplicáveis a Usuários, Comentários e Notícias
    const categorias = [
      "Conteúdo ofensivo",
      "Discurso de ódio",
      "Assédio ou intimidação",
      "Informação falsa",
      "Spam ou propaganda indevida",
      "Violação de privacidade",
      "Conteúdo impróprio",
      "Atividade ilegal",
      "Identidade falsa ou enganosa",
      "Outro"
    ];

    await db.exec("BEGIN TRANSACTION");

    for (const nomeCategoria of categorias) {
      const result = await db.get(
        `SELECT 1 FROM CATEGORIA_DENUNCIA WHERE categoria = ?`,
        [nomeCategoria]
      );

      if (!result) {
        await db.run(
          `INSERT INTO CATEGORIA_DENUNCIA (categoria) VALUES (?)`,
          [nomeCategoria]
        );
      }
    }

    await db.exec("COMMIT");
    console.log(chalk.green("Tabela CATEGORIA_DENUNCIA criada e preenchida com sucesso!"));
  } catch (error) {
    await db.exec("ROLLBACK");
    console.error(chalk.red("Erro ao criar ou preencher a tabela CATEGORIA_DENUNCIA:", error.message));
  }
}

export async function selectCategoriasDenuncia() {
  try {
    const result = await db.all(
      `SELECT idCategoriaDenuncia, categoria 
       FROM CATEGORIA_DENUNCIA 
       ORDER BY categoria`
    );

    return result;
  } catch (error) {
    console.error("Erro ao selecionar categorias de denúncia:", error);
    return [];
  }
}