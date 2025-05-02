import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableAmizade() {
    try {
      await db.exec(
        `CREATE TABLE IF NOT EXISTS AMIZADE (
          idAmizade INTEGER PRIMARY KEY AUTOINCREMENT,
          dataAmizade DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          apelido1 VARCHAR(15) NOT NULL,
          apelido2 VARCHAR(15) NOT NULL,
          FOREIGN KEY(apelido1) REFERENCES USUARIO(apelido),
          FOREIGN KEY(apelido2) REFERENCES USUARIO(apelido)
        );`
      );
  
      console.log(chalk.green("Tabela AMIZADE criada com sucesso!"));
    } catch (error) {
      console.error(chalk.red("Erro ao criar a tabela AMIZADE:", error.message));
    }
  }
  