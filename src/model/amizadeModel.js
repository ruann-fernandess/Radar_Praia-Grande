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

export async function verificaAmizade(apelido1, apelido2) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM amizade
       WHERE apelido1 = ? AND apelido2 = ?`,
      [apelido1, apelido2]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function insertAmizade(apelido1, apelido2) {
  try {
    await db.run(
      `INSERT INTO amizade 
                (apelido1, apelido2) 
                VALUES (?, ?)`,
      [
        apelido1,
        apelido2
      ]
    );

    console.log(chalk.green("Usuário seguido com sucesso!"));
    return { statusCode: 200, message: "Usuário seguido com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao seguir usuário:", error.message));
    return { statusCode: 500, message: "Erro ao seguir usuário!"};
  }
}

export async function deleteAmizade(apelido1, apelido2) {
  try {
    await db.run(
      `DELETE FROM amizade
       WHERE apelido1 = ?
       AND apelido2 = ?`,
       [
        apelido1,
        apelido2
       ]
      );
    console.log(chalk.green(`O usuário '${apelido1}' deixou de seguir o usuário '${apelido2}' com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao deixar de seguir o usuário:", error.message));
  }
}

export async function deleteTodasAmizadesPorApelido(apelido) {
  try {
    await db.run(
      `DELETE FROM amizade
       WHERE apelido1 = ?
       OR apelido2 = ?`,
       [
        apelido,
        apelido
       ]
      );
    console.log(chalk.green(`Todas as amizades do usuário '${apelido}' foram deletadas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao deletar amizades do usuário:", error.message));
  }
}

export async function contaSeguidores(apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM amizade
       WHERE apelido1 = ?`,
      [apelido]
    );

    console.log(chalk.green("Contagem de seguidores realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de seguidores realizada com sucesso!",
      quantidadeSeguidores: result.count
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar seguidores do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar seguidores do usuário!",
      quantidadeSeguidores: 0
    };
  }
}

export async function contaSeguindo(apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM amizade
       WHERE apelido2 = ?`,
      [apelido]
    );

    console.log(chalk.green("Contagem de seguindo realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de seguindo realizada com sucesso!",
      quantidadeSeguindo: result.count
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar seguindo do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar seguindo do usuário!",
      quantidadeSeguindo: 0
    };
  }
}