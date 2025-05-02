import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableArquivo() {
  try {

    await db.exec(
      `CREATE TABLE IF NOT EXISTS ARQUIVO ( 
        idArquivo INTEGER PRIMARY KEY AUTOINCREMENT,
        caminho VARCHAR(200) NOT NULL,
        idNoticia INTEGER NOT NULL,
        FOREIGN KEY(idNoticia) REFERENCES NOTICIA(idNoticia)
      );`
    );

    console.log(chalk.green("Tabela ARQUIVO criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela ARQUIVO:", error.message));
  }
}
