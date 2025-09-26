import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableDenunciaUsuario() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS DENUNCIA_USUARIO (
        idDenunciaUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
        apelidoDenunciado VARCHAR(30) NOT NULL,
        apelido VARCHAR(30) NOT NULL,
        idCategoriaDenuncia INTEGER NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
        apelidoAdmin VARCHAR(30),
        dataRevisao DATETIME,
        status VARCHAR(50) DEFAULT "Aguardando revisão dos administradores", 
        FOREIGN KEY (apelidoDenunciado) REFERENCES USUARIO(apelido),
        FOREIGN KEY (apelido) REFERENCES USUARIO(apelido),
        FOREIGN KEY (idCategoriaDenuncia) REFERENCES CATEGORIA_DENUNCIA(idCategoriaDenuncia),
        FOREIGN KEY (apelidoAdmin) REFERENCES USUARIO(apelido)
      );
    `);

    console.log(chalk.green("Tabela DENUNCIA_USUARIO criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela DENUNCIA_USUARIO:", error.message));
  }
}

export async function verificaDenunciaUsuario(apelidoDenunciado, apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_usuario
       WHERE apelidoDenunciado = ?
         AND apelido = ?`,
      [apelidoDenunciado, apelido]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function insertDenunciaUsuario(categoriaDenunciaSelecionada, denuncia, apelidoDenunciado, apelido) {
  try {
    await db.run(
      `INSERT INTO denuncia_usuario 
                (idCategoriaDenuncia, descricao, apelidoDenunciado, apelido) 
                VALUES (?, ?, ?, ?)`,
      [
        categoriaDenunciaSelecionada,
        denuncia, 
        apelidoDenunciado, 
        apelido
      ]
    );

    console.log(chalk.green("Denúncia de usuário inserida com sucesso!"));
    return { statusCode: 200, message: "Denúncia de usuário inserida com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir denúncia de usuário:", error.message));
    return { statusCode: 500, message: "Erro ao inserir denúncia de usuário!"};
  }
}