import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableCurtidaNoticia() {
  try {
    
    await db.exec(
      `CREATE TABLE IF NOT EXISTS CURTIDA_NOTICIA ( 
        idCurtidaNoticia INTEGER PRIMARY KEY AUTOINCREMENT,
        idNoticia INTEGER NOT NULL,
        apelido VARCHAR(30) NOT NULL,
        FOREIGN KEY(idNoticia) REFERENCES NOTICIA(idNoticia),
        FOREIGN KEY(apelido) REFERENCES USUARIO(apelido)
      );`
    );

    console.log(chalk.green("Tabela CURTIDA_NOTICIA criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela CURTIDA_NOTICIA:", error.message));
  }
}

export async function insertCurtidaNoticia(idNoticia, apelido) {
  try {
    await db.run(
      `INSERT INTO curtida_noticia 
                (idNoticia, apelido) 
                VALUES (?, ?)`,
      [
        idNoticia,
        apelido
      ]
    );

    console.log(chalk.green("Notícia curtida com sucesso!"));
    return { statusCode: 200, message: "Notícia curtida com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao curtir notícia:", error.message));
    return { statusCode: 500, message: "Erro ao curtir notícia!"};
  }
}

export async function deleteCurtidaNoticia(idNoticia, apelido) {
  try {
    await db.run(
      `DELETE FROM curtida_noticia
       WHERE idNoticia = ?
       AND apelido = ?`,
       [
        idNoticia,
        apelido
       ]
      );
    console.log(chalk.green(`O usuário '${apelido}' removeu a curtida com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtida:", error.message));
  }
}

export async function deleteTodasCurtidasNoticia(idNoticia) {
  try {
    await db.run(
      `DELETE FROM curtida_noticia
       WHERE idNoticia = ? `,
       [
        idNoticia
       ]
      );
    console.log(chalk.green(`Todas as curtidas da notícia '${idNoticia}' foram removidas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtidas:", error.message));
  }
}

export async function deleteTodasCurtidasNoticiaPorApelido(apelido) {
  try {
    await db.run(
      `DELETE FROM curtida_noticia
       WHERE apelido = ? `,
       [
        apelido
       ]
      );
    console.log(chalk.green(`Todas as curtidas do usuário '${apelido}' foram removidas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtidas:", error.message));
  }
}

export async function verificaCurtidaNoticia(idNoticia, apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM curtida_noticia
       WHERE idNoticia = ? AND apelido = ?`,
      [idNoticia, apelido]
    );

    return result.count;
  } catch (error) {
    return -1; 
  }
}

export async function contaCurtidasNoticia(idNoticia) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
      FROM CURTIDA_NOTICIA CN
      INNER JOIN USUARIO U
        ON CN.apelido = U.apelido
      WHERE CN.idNoticia = ?
        AND U.desativado = 0`,
      [idNoticia]
    );

    console.log(chalk.green("Contagem de curtidas da notícia realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de curtidas da notícia realizada com sucesso!",
      quantidadeCurtidasNoticia: result.count
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar curtidas da notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar curtidas da notícia!",
      quantidadeCurtidasNoticia: 0
    };
  }
}