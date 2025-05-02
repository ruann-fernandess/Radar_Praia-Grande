import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableCurtidaNoticia() {
  try {
    
    await db.exec(
      `CREATE TABLE IF NOT EXISTS CURTIDA_NOTICIA ( 
        idCurtidaNoticia INTEGER PRIMARY KEY AUTOINCREMENT,
        idNoticia INTEGER NOT NULL,
        apelido VARCHAR(15) NOT NULL,
        FOREIGN KEY(idNoticia) REFERENCES NOTICIA(idNoticia),
        FOREIGN KEY(apelido) REFERENCES USUARIO(apelido)
      );`
    );

    console.log(chalk.green("Tabela CURTIDA_NOTICIA criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela CURTIDA_NOTICIA:", error.message));
  }
}
