import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableImagem() {
  try {

    await db.exec(
      `CREATE TABLE IF NOT EXISTS IMAGEM ( 
        idImagem INTEGER PRIMARY KEY AUTOINCREMENT,
        imagem BLOB NOT NULL,
        apelido VARCHAR(30),
        idNoticia INTEGER,
        identificador VARCHAR(7) NOT NULL,
        FOREIGN KEY(apelido) REFERENCES USUARIO(apelido),
        FOREIGN KEY(idNoticia) REFERENCES NOTICIA(idNoticia)
      );`
    );

    console.log(chalk.green("Tabela IMAGEM criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela IMAGEM:", error.message));
  }
}

export async function insertImagem(imagem) {
  try {
    await db.run(
      `INSERT INTO imagem 
        (imagem, apelido, idNoticia, identificador) 
       VALUES (?, ?, ?, ?)`,
      [
        imagem.blob,
        imagem.apelido,
        imagem.idNoticia,
        imagem.identificador
      ]
    );

    console.log(chalk.green("Imagem inserida com sucesso!"));
    return { statusCode: 200, message: "Imagem inserida com sucesso!" };
  } catch (error) {
    console.error(chalk.red(" Erro ao inserir imagem:", error.message));
    return { statusCode: 500, message: "Erro ao inserir imagem!" };
  }
}

export async function updateImagem(imagem) {
  try {
    await db.run(
      `UPDATE imagem 
       SET imagem = ?, idNoticia = ? 
       WHERE apelido = ? AND identificador = ?`,
      [
        imagem.blob,
        imagem.idNoticia,
        imagem.apelido,
        imagem.identificador
      ]
    );

    console.log(chalk.green("Imagem atualizada com sucesso!"));
    return { statusCode: 200, message: "Imagem atualizada com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao atualizar imagem:", error.message));
    return { statusCode: 500, message: "Erro ao atualizar imagem!"};
  }
}

export async function deleteImagensNoticia(idNoticia) {
  try {
    await db.run(
      `DELETE FROM IMAGEM WHERE idNoticia = ? AND identificador = ?`,
      [idNoticia, "Notícia"]);
    console.log(chalk.green(`Imagem da notícia apagada com sucesso!`));
  } catch (error) {
    console.error(chalk.red(`Erro ao apagar imagem da notícia: '${error.message}'`));
  }
}

export async function deleteImagensUsuario(apelido) {
  try {
    await db.run(
      `DELETE FROM IMAGEM WHERE apelido = ?`,
      [apelido]);
    console.log(chalk.green(`Imagens apagadas com sucesso!`));
  } catch (error) {
    console.error(chalk.red(`Erro ao apagar imagens: '${error.message}'`));
  }
}