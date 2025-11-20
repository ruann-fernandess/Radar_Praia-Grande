import { openDb } from "./connect.js";
import bcrypt from "bcryptjs";
const db = await openDb();
import chalk from 'chalk';

export async function createTableToken() {
  try {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS TOKEN ( 
        idToken INTEGER PRIMARY KEY AUTOINCREMENT,
        token VARCHAR(64) NOT NULL UNIQUE,
        identificador VARCHAR(20) NOT NULL,
        validado INTEGER NOT NULL DEFAULT 0,
        apelido VARCHAR(30),
        nome VARCHAR(100),
        email VARCHAR(100) NOT NULL,
        senha VARCHAR(100),
        dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        dataExpiracao DATETIME NOT NULL
      );`
    );

    console.log(chalk.green("Tabela TOKEN criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela TOKEN:", error.message));
  }
}

export async function insertTokenConfirmarCadastro(token) {
  try {
    // 10 = quantidade de vezes que o algoritmo vai processar, ou reforçar, a criptografia
    const hash = bcrypt.hashSync(token.senha, 10);
    const expiracao = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Expiração do token em 1 hora

    await db.run(
      `INSERT INTO token 
        (token, identificador, apelido, nome, email, senha, dataExpiracao) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        token.token,
        "Confirmar cadastro",
        token.apelido,
        token.nome,
        token.email,
        hash,
        expiracao
      ]
    );

    console.log(chalk.green("Token de confirmação de cadastro inserido com sucesso!"));
    return { statusCode: 200, message: "Token de confirmação de cadastro inserido com sucesso!" };
  } catch (error) {
    console.error(chalk.red(" Erro ao inserir token de confirmação de cadastro:", error.message));
    return { statusCode: 500, message: "Erro ao inserir token de confirmação de cadastro!" };
  }
}

export async function insertTokenRedefinirSenha(token) {
  try {
    const expiracao = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // Expiração do token em 1 hora

    await db.run(
      `INSERT INTO token 
        (token, identificador, email, dataExpiracao) 
       VALUES (?, ?, ?, ?)`,
      [
        token.token,
        "Redefinir senha",
        token.email,
        expiracao
      ]
    );

    console.log(chalk.green("Token de redefinição de senha inserido com sucesso!"));
    return { statusCode: 200, message: "Token de redefinição de senha inserido com sucesso!" };
  } catch (error) {
    console.error(chalk.red(" Erro ao inserir token de redefinição de senha:", error.message));
    return { statusCode: 500, message: "Erro ao inserir token de redefinição de senha!" };
  }
}

export async function selectDadosTokenConfirmarCadastroValidado(token) {
  try {
    const result = await db.get(
      `SELECT apelido, nome, email, senha 
       FROM TOKEN 
       WHERE token = ? AND identificador = ? AND validado = ?`,
      [
        token,
        "Confirmar cadastro",
        1
      ]
    );

    // Se não encontrou, retorna null
    return result || null;
  } catch (error) {
    console.error("Erro ao buscar token validado:", error);
    return null;
  }
}

export async function selectEmailTokenRedefinirSenhaValidado(token) {
  try {
    const result = await db.get(
      `SELECT email 
       FROM TOKEN 
       WHERE token = ? AND identificador = ? AND validado = ?`,
      [
        token,
        "Redefinir senha",
        1
      ]
    );

    // Se não encontrou, retorna null
    return result || null;
  } catch (error) {
    console.error("Erro ao buscar token validado:", error);
    return null;
  }
}

export async function verificaToken(token, identificador) {
  try {
    const result = await db.get(
      `SELECT validado FROM TOKEN WHERE token = ? AND identificador = ?`,
      [token, identificador]
    );

    if (!result) {
      return { existe: false, valido: false };
    }

    return { existe: true, valido: result.validado == 0 };
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return { existe: false, valido: false };
  }
}

export async function updateStatusValidadoToken(validado, token, identificador) {
  try {
    await db.run(
      `UPDATE token 
       SET validado = ? 
       WHERE token = ? AND identificador = ?`,
      [
        validado,
        token,
        identificador
      ]
    );

    console.log(chalk.green("Token atualizado com sucesso!"));
    return { statusCode: 200, message: "Token atualizado com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao atualizar token:", error.message));
    return { statusCode: 500, message: "Erro ao atualizar token!"};
  }
}