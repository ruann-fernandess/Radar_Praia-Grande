import { openDb } from "./connect.js";
import chalk from 'chalk';

const db = await openDb();

export async function createTableUsuario() {
  try {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS USUARIO (
                apelido VARCHAR(15) PRIMARY KEY COLLATE NOCASE,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE COLLATE NOCASE,
                senha VARCHAR(100) NOT NULL,
                biografia VARCHAR(200) DEFAULT "Estou usando o RADAR PG!",
                dataCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                admin INTEGER NOT NULL DEFAULT 0
            );`
    );
    
    console.log(chalk.green("Tabela USUARIO criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela USUARIO:", error.message));
  }
}

export async function verificaApelidoUsuario(apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count FROM usuario WHERE apelido = ?`,
      [apelido]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function verificaEmail(email) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count FROM usuario WHERE email = ?`,
      [email]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function verificaLogin(email, senha) {
  try {
    const usuario = await db.get(
      // IP = Imagem perfil
      // IB = Imagem fotoCapa
      `SELECT 
        U.apelido, 
        U.email, 
        U.nome, 
        U.biografia, 
        IP.imagem AS fotoPerfil,
        IB.imagem AS fotoCapa
      FROM USUARIO U
      LEFT JOIN IMAGEM IP ON U.apelido = IP.apelido AND IP.identificador = "Ícone"
      LEFT JOIN IMAGEM IB ON U.apelido = IB.apelido AND IB.identificador = "Banner"
      WHERE U.email = ? AND U.senha = ?`,
      [email, senha]
    );

    if (!usuario) return null;

    // Função para converter BLOB (Buffer) em data URI base64
    function blobToDataURI(blobBuffer, mimeType = 'image/jpeg') {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }

    // Cria novo objeto com as imagens convertidas
    return {
      apelido: usuario.apelido,
      email: usuario.email,
      nome: usuario.nome,
      biografia: usuario.biografia,
      fotoPerfil: blobToDataURI(usuario.fotoPerfil),
      fotoCapa: blobToDataURI(usuario.fotoCapa),
    };
  } catch (error) {
    console.error(chalk.red("Email e senha não coincidem", error.message));
    return null;
  }
}

export async function insertUsuario(usuario) {
  try {
    await db.run(
      `INSERT INTO usuario 
                (apelido, nome, email, senha) 
                VALUES (?, ?, ?, ?)`,
      [
        usuario.apelido,
        usuario.nome,
        usuario.email,
        usuario.senha,
      ]
    );

    console.log(chalk.green("Usuário inserido com sucesso!"));
    return { statusCode: 200, message: "Usuário inserido com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir usuário:", error.message));
    return { statusCode: 500, message: "Erro ao inserir usuário!"};
  }
}

//   o update será somente de atributos que não são chave primária. para atualizar a chave primária é necessário outro tipo de abordagem
export async function updateUsuario(usuario) {
  try {
    await db.run(
      `UPDATE usuario 
                SET nome = ?, 
                    email = ?, 
                    biografia = ?
                WHERE apelido = ?`,
      [
        usuario.nome,
        usuario.email,
        usuario.biografia || "Estou usando o RADAR PG!",
        usuario.apelido, // qual usuário será atualizado
      ]
    );

    console.log(chalk.green("Usuário atualizado com sucesso!"));
    return { statusCode: 200, message: "Usuário atualizado com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao atualizar usuário:", error.message));
    return { statusCode: 500, message: "Erro ao atualizar usuário!" };
  }
}

export async function buscarUsuarioPorApelido(apelido) {
  try {
    const usuario = await db.get(
      `SELECT 
        U.apelido, 
        U.email, 
        U.nome, 
        U.biografia, 
        IP.imagem AS fotoPerfil,
        IB.imagem AS fotoCapa
      FROM USUARIO U
      LEFT JOIN IMAGEM IP ON U.apelido = IP.apelido AND IP.identificador = "Ícone"
      LEFT JOIN IMAGEM IB ON U.apelido = IB.apelido AND IB.identificador = "Banner"
      WHERE U.apelido = ?`,
      [apelido]
    );

    return usuario || null;
  } catch (error) {
    console.error("Erro ao buscar usuário por apelido:", error.message);
    return null;
  }
}


export async function deleteUsuario(apelido) {
  try {
    await db.run(`DELETE FROM USUARIO WHERE apelido = ?`, [apelido]);
    console.log(chalk.green(`Usuário '${apelido}' apagado com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao apagar o usuário:", error.message));
  }
}

