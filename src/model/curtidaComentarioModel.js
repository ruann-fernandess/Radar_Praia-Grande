import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableCurtidaComentario() {
    try {
      await db.exec(
        `CREATE TABLE IF NOT EXISTS CURTIDA_COMENTARIO (
          idCurtidaComentario INTEGER PRIMARY KEY AUTOINCREMENT,
          idComentario INTEGER NOT NULL,
          apelido VARCHAR(30) NOT NULL,
          FOREIGN KEY(idComentario) REFERENCES COMENTARIO(idComentario),
          FOREIGN KEY(apelido) REFERENCES USUARIO(apelido)
        );`
      );
  
      console.log(chalk.green("Tabela CURTIDA_COMENTARIO criada com sucesso!"));
    } catch (error) {
      console.error(chalk.red("Erro ao criar a tabela CURTIDA_COMENTARIO:", error.message));
    }
  }

export async function insertCurtidaComentarioNoticia(idComentario, apelido) {
  try {
    await db.run(
      `INSERT INTO curtida_comentario 
                (idComentario, apelido) 
                VALUES (?, ?)`,
      [
        idComentario,
        apelido
      ]
    );

    console.log(chalk.green("Comentário da notícia curtido com sucesso!"));
    return { statusCode: 200, message: "Comentário da notícia curtido com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao curtir comentário da notícia:", error.message));
    return { statusCode: 500, message: "Erro ao curtir comentário da notícia!"};
  }
}

export async function deleteCurtidaComentarioNoticia(idComentario, apelido) {
  try {
    await db.run(
      `DELETE FROM curtida_comentario
       WHERE idComentario = ?
       AND apelido = ?`,
       [
        idComentario,
        apelido
       ]
      );
    console.log(chalk.green(`O usuário '${apelido}' removeu a curtida do comentário da notícia com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtida do comentário da notícia:", error.message));
  }
}

export async function deleteTodasCurtidasComentarioNoticia(idComentario) {
  try {
    await db.run(
      `DELETE FROM curtida_comentario
       WHERE idComentario = ? `,
       [
        idComentario
       ]
      );
    console.log(chalk.green(`Todas as curtidas do comentário da notícia '${idComentario}' foram removidas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtidas do comentário da notícia:", error.message));
  }
}

export async function deleteTodasCurtidasComentariosNoticiaPorNoticia(idNoticia) { 
  try {
    await db.run(
      `DELETE FROM curtida_comentario
       WHERE idComentario IN (
         SELECT C.idComentario
         FROM comentario C
         WHERE C.idNoticia = ?
       )`,
      [idNoticia]
    );

    console.log(chalk.green(`Todas as curtidas dos comentários da notícia '${idNoticia}' foram removidas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtidas dos comentários da notícia:", error.message));
  }
}

export async function deleteTodasCurtidasComentarioNoticiaPorApelido(apelido) {
  try {
    await db.run(
      `DELETE FROM curtida_comentario
       WHERE apelido = ? `,
       [
        apelido
       ]
      );
    console.log(chalk.green(`Todas as curtidas do comentário do usuário '${apelido}' foram removidas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtidas do comentário:", error.message));
  }
}

export async function deleteCurtidasComentariosNoticiaPorAutorDaNoticia(apelidoAutor) {
  try {
    await db.run(
      `DELETE FROM curtida_comentario
       WHERE EXISTS (
         SELECT 1
         FROM comentario C
         JOIN noticia N ON N.idNoticia = C.idNoticia
         WHERE C.idComentario = curtida_comentario.idComentario
           AND N.apelido = ?
       )`,
      [apelidoAutor]
    );

    console.log(chalk.green(`Todas as curtidas de comentários das notícias do autor '${apelidoAutor}' foram removidas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover curtidas de comentários das notícias do autor:", error.message));
  }
}

export async function verificaCurtidaComentarioNoticia(idComentario, apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM curtida_comentario
       WHERE idComentario = ? AND apelido = ?`,
      [idComentario, apelido]
    );

    return result.count;
  } catch (error) {
    return -1; 
  }
}

export async function contaCurtidasComentarioNoticia(idComentario) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM curtida_comentario
       WHERE idComentario = ?`,
      [idComentario]
    );

    console.log(chalk.green("Contagem de curtidas do comentário da notícia realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de curtidas do comentário da notícia realizada com sucesso!",
      quantidadeCurtidasComentarioNoticia: result.count
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar curtidas do comentário da notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar curtidas do comentário da notícia!",
      quantidadeCurtidasComentarioNoticia: 0
    };
  }
}