import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableComentario() {
    try {
      await db.exec(
        `CREATE TABLE IF NOT EXISTS COMENTARIO (
          idComentario INTEGER PRIMARY KEY AUTOINCREMENT,
          comentario VARCHAR(200) NOT NULL,
          dataComentario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          idNoticia INTEGER NOT NULL,
          apelido VARCHAR(30) NOT NULL,
          FOREIGN KEY(idNoticia) REFERENCES NOTICIA(idNoticia),
          FOREIGN KEY(apelido) REFERENCES USUARIO(apelido)
        );`
      );
  
      console.log(chalk.green("Tabela COMENTARIO criada com sucesso!"));
    } catch (error) {
      console.error(chalk.red("Erro ao criar a tabela COMENTARIO:", error.message));
    }
  }

export async function insertComentarioNoticia(comentario, idNoticia, apelido) {
  try {
    await db.run(
      `INSERT INTO comentario 
                (comentario, idNoticia, apelido) 
                VALUES (?, ?, ?)`,
      [
        comentario, 
        idNoticia, 
        apelido
      ]
    );

    console.log(chalk.green("Comentário inserido com sucesso!"));
    return { statusCode: 200, message: "Comentário inserido com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir comentário:", error.message));
    return { statusCode: 500, message: "Erro ao inserir comentário!"};
  }
}

export async function updateComentarioNoticia(comentarioEditado, idComentario) {
  try {
    await db.run(
      `UPDATE comentario 
                SET comentario = ?
                WHERE idComentario = ?`,
      [
        comentarioEditado,
        idComentario
      ]
    );

    console.log(chalk.green("Comentário atualizado com sucesso!"));
    return { statusCode: 200, message: "Comentário atualizado com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao atualizar comentário:", error.message));
    return { statusCode: 500, message: "Erro ao atualizar comentário!" };
  }
}

export async function selectComentariosPorNoticia(idNoticia, paginaComentarios, limite) {
  try {
    const offset = (paginaComentarios - 1) * limite;

    const rows = await db.all(
      `SELECT 
        C.idComentario, 
        C.comentario, 
        datetime(C.dataComentario, 'localtime') AS dataComentario, 
        C.apelido, 
        IP.imagem AS fotoPerfil
      FROM COMENTARIO C
      INNER JOIN USUARIO U ON C.apelido = U.apelido
      LEFT JOIN IMAGEM IP ON U.apelido = IP.apelido AND IP.identificador = "Ícone"
      WHERE C.idNoticia = ?
      ORDER BY C.idComentario DESC
      LIMIT ? OFFSET ?`,
      [idNoticia, limite, offset]
    );

    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    const comentarios = rows.map(comentario => ({
      idComentario: comentario.idComentario,
      comentario: comentario.comentario,
      dataComentario: comentario.dataComentario,
      apelido: comentario.apelido,
      fotoPerfil: blobToDataURI(comentario.fotoPerfil)
    }));

    return {
      comentarios
    };

  } catch (error) {
    console.error("Erro ao capturar comentários da notícia:", error.message);
    return { comentarios: [] };
  }
}

export async function deleteComentarioNoticia(idComentario) {
  try {
    await db.run(
      `DELETE FROM comentario 
       WHERE idComentario = ?`,
       [
        idComentario
       ]
      );
    console.log(chalk.green(`O comentário '${idComentario}' foi deletado com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao deletar comentário:", error.message));
  }
}

export async function deleteTodosComentariosPorNoticia(idNoticia) {
  try {
    await db.run(
      `DELETE FROM comentario 
       WHERE idNoticia = ?`,
       [
        idNoticia
       ]
      );
    console.log(chalk.green(`Todas os comentários da notícia '${idNoticia}' foram deletadas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao deletar comentários da notícia:", error.message));
  }
}

export async function deleteTodosComentariosPorApelido(apelido) {
  try {
    await db.run(
      `DELETE FROM comentario 
       WHERE apelido = ?`,
       [
        apelido
       ]
      );
    console.log(chalk.green(`Todas os comentários do usuário '${apelido}' foram deletados com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao deletar comentários do usuário:", error.message));
  }
}

export async function contaComentariosNoticia(idNoticia) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM comentario 
       WHERE idNoticia = ?`,
      [idNoticia]
    );

    console.log(chalk.green("Contagem de comentários da notícia realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de comentários realizada da notícia com sucesso!",
      quantidadeComentariosNoticia: result.count
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar comentários da notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar comentários da notícia!",
      quantidadeComentariosNoticia: 0
    };
  }
}

export async function verificaComentarioNoticia(idComentario) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM comentario
       WHERE idComentario = ?`,
      [idComentario]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function deleteComentariosNoticiaPorAutorDaNoticia(apelido) {
  try {
    await db.run(
      `DELETE FROM comentario
       WHERE EXISTS (
         SELECT 1
         FROM noticia N
         WHERE N.idNoticia = comentario.idNoticia
           AND N.apelido = ?
       )`,
      [apelido]
    );

    console.log(chalk.green(`Todos os comentários das notícias do autor '${apelido}' foram removidos com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao remover comentários das notícias do autor:", error.message));
  }
}
