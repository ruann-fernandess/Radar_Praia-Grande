import { decodeBase64 } from "bcryptjs";
import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableDenunciaComentario() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS DENUNCIA_COMENTARIO (
        idDenunciaComentario INTEGER PRIMARY KEY AUTOINCREMENT,
        idComentario INTEGER NOT NULL,
        apelido VARCHAR(30) NOT NULL,
        idCategoriaDenuncia INTEGER NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
        apelidoAdmin VARCHAR(30),
        dataRevisao DATETIME,
        status VARCHAR(50) DEFAULT "Aguardando revisão dos administradores", 
        FOREIGN KEY (idComentario) REFERENCES COMENTARIO(idComentario),
        FOREIGN KEY (apelido) REFERENCES USUARIO(apelido),
        FOREIGN KEY (idCategoriaDenuncia) REFERENCES CATEGORIA_DENUNCIA(idCategoriaDenuncia),
        FOREIGN KEY (apelidoAdmin) REFERENCES USUARIO(apelido)
      );
    `);

    console.log(chalk.green("Tabela DENUNCIA_COMENTARIO criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela DENUNCIA_COMENTARIO:", error.message));
  }
}

export async function verificaDenunciaComentario(idComentario, apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_comentario
       WHERE idComentario = ?
         AND apelido = ?`,
      [idComentario, apelido]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function insertDenunciaComentario(categoriaDenunciaSelecionada, denuncia, idComentario, apelido) {
  try {
    await db.run(
      `INSERT INTO denuncia_comentario 
                (idCategoriaDenuncia, descricao, idComentario, apelido) 
                VALUES (?, ?, ?, ?)`,
      [
        categoriaDenunciaSelecionada,
        denuncia, 
        idComentario, 
        apelido
      ]
    );

    console.log(chalk.green("Denúncia do comentário inserida com sucesso!"));
    return { statusCode: 200, message: "Denúncia do comentário inserida com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir denúncia de comentário:", error.message));
    return { statusCode: 500, message: "Erro ao inserir denúncia de comentário!"};
  }
}