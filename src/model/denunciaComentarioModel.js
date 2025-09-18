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
        aprovada BOOLEAN DEFAULT 0,
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