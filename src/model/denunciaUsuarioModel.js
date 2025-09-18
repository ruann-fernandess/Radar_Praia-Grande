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
        aprovada BOOLEAN DEFAULT 0,
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