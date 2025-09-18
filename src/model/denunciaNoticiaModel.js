import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableDenunciaNoticia() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS DENUNCIA_NOTICIA (
        idDenunciaNoticia INTEGER PRIMARY KEY AUTOINCREMENT,
        idNoticia INTEGER NOT NULL,
        apelido VARCHAR(30) NOT NULL,
        categoria VARCHAR(80) NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
        apelidoAdmin VARCHAR(30),
        dataRevisao DATETIME,
        aprovada BOOLEAN DEFAULT 0,
        FOREIGN KEY (idNoticia) REFERENCES NOTICIA(idNoticia),
        FOREIGN KEY (apelido) REFERENCES USUARIO(apelido),
        FOREIGN KEY (apelidoAdmin) REFERENCES USUARIO(apelido)
      );
    `);

    console.log(chalk.green("Tabela DENUNCIA_NOTICIA criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela DENUNCIA_NOTICIA:", error.message));
  }
}