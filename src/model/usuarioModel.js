import { openDb } from "./connect.js";

const db = await openDb();

export async function createTableUsuario() {
  try {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS USUARIO (
                apelido VARCHAR(15) PRIMARY KEY COLLATE NOCASE,
                nome VARCHAR(100) NOT NULL,
                fotoPerfil VARCHAR(200) DEFAULT "/imagens/iconeUsuarioPadrao.jpg",
                email VARCHAR(100) NOT NULL UNIQUE COLLATE NOCASE,
                fotoCapa VARCHAR(200) DEFAULT "/imagens/bannerUsuarioPadrao.jpg",
                senha VARCHAR(100) NOT NULL,
                biografia VARCHAR(200) DEFAULT "Estou usando o RADAR PG!",
                dataCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                admin INTEGER NOT NULL DEFAULT 0
            );`
    );
    
    console.log("✅ Tabela USUARIO criada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar a tabela USUARIO:", error.message);
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
      `SELECT apelido, email, nome, fotoPerfil, fotoCapa, biografia FROM USUARIO WHERE email = ? AND senha = ?`, 
      [email, senha]
    );

    return usuario || null; 
  } catch (error) {
    console.error("❌ Email e senha não coincidem", error.message);
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

    console.log("✅ Usuário inserido com sucesso!");
    return { statusCode: 200, message: "✅ Usuário inserido com sucesso!" };
  } catch (error) {
    console.error("❌ Erro ao inserir usuário:", error.message);
    return { statusCode: 500, message: "❌ Erro ao inserir usuário: " + error.message };
  }
}

//   o update será somente de atributos que não são chave primária. para atualizar a chave primária é necessário outro tipo de abordagem
export async function updateUsuario(usuario) {
  try {
    await db.run(
      `UPDATE usuario 
                SET nome = ?, 
                    fotoPerfil = ?, 
                    email = ?, 
                    fotoCapa = ?, 
                    biografia = ?
                WHERE apelido = ?`,
      [
        usuario.nome,
        usuario.fotoPerfil || "/imagens/iconeUsuarioPadrao.jpg",
        usuario.email,
        usuario.fotoCapa || "/imagens/bannerUsuarioPadrao.jpg",
        usuario.biografia || "Estou usando o RADAR PG!",
        usuario.apelido, // qual usuário será atualizado
      ]
    );

    console.log("✅ Usuário atualizado com sucesso!");
    return { statusCode: 200, message: "✅ Usuário atualizado com sucesso!" };
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error.message);
    return { statusCode: 500, message: "❌ Erro ao atualizar usuário: " + error.message };
  }
}

export async function deleteUsuario(apelido) {
  try {
    await db.run(`DELETE FROM USUARIO WHERE apelido = ?`, [apelido]);
    console.log(`🗑️ Usuário '${apelido}' apagado com sucesso!`);
  } catch (error) {
    console.error("❌ Erro ao apagar o usuário:", error.message);
  }
}

