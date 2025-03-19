import { openDb } from "../src/database/connect.js";




export async function createTable() {
  try {
    const db = await openDb();

    await db.exec(`
      CREATE TABLE IF NOT EXISTS USUARIO (
  cd_apelido_usuario VARCHAR(15) PRIMARY KEY,
  nm_usuario VARCHAR(100) NOT NULL,
  im_usuario VARCHAR(200),
  nm_email_usuario VARCHAR(100) NOT NULL UNIQUE,
  im_capa_usuario VARCHAR(200),
  nm_senha_usuario VARCHAR(100) NOT NULL,
  ds_biografia_usuario VARCHAR(200),
  dt_perfil_usuario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
    `);

    await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS unique_email_usuario ON USUARIO(nm_email_usuario);`);

    console.log("✅ Tabela USUARIO criada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar a tabela USUARIO:", error.message);
  }
}



export async function verificaEmail(nm_email_usuario) {
    try {
        const db = await openDb();
        const result = await db.get(
            `SELECT COUNT(*) AS count FROM usuario WHERE nm_email_usuario = ?`, 
            [nm_email_usuario]
        );

        return result.count; // Retorna a quantidade de usuários com esse e-mail
    } catch (error) {
        return -1; // Retorna um valor de erro
    }
}

export async function verificaApelidoUsuario(cd_apelido_usuario) {
    try {
        const db = await openDb();
        const result = await db.get(
            `SELECT COUNT(*) AS count FROM usuario WHERE cd_apelido_usuario = ?`, 
            [cd_apelido_usuario]
        );

        return result.count; // Retorna a quantidade de usuários com esse e-mail
    } catch (error) {
        return -1; // Retorna um valor de erro
    }
}


export async function insertUsuario(usuario) {
  try {
    const db = await openDb();
    await db.run(
      `INSERT INTO usuario 
        (cd_apelido_usuario, nm_usuario, im_usuario, nm_email_usuario, im_capa_usuario, nm_senha_usuario, ds_biografia_usuario) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario.cd_apelido_usuario,
        usuario.nm_usuario,
        usuario.im_usuario || null, // Se não for fornecido, passa NULL
        usuario.nm_email_usuario,
        usuario.im_capa_usuario || null, // Se não for fornecido, passa NULL
        usuario.nm_senha_usuario,
        usuario.ds_biografia_usuario || null, // Se não for fornecido, passa NULL
      ]
    );

    console.log("✅ Usuário inserido com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inserir usuário:", error.message);
  }
}

//   o update será somente de atributos que não são chave primária. para atualizar a chave primária é necessário outro tipo de abordagem
export async function updateUsuario(usuario) {
  try {
    const db = await openDb();
    await db.run(
      `UPDATE usuario 
        SET nm_usuario = ?, 
            im_usuario = ?, 
            nm_email_usuario = ?, 
            im_capa_usuario = ?, 
            nm_senha_usuario = ?, 
            ds_biografia_usuario = ?, 
            dt_perfil_usuario = ?
        WHERE cd_apelido_usuario = ?`,
      [
        usuario.nm_usuario,
        usuario.im_usuario || null,
        usuario.nm_email_usuario,
        usuario.im_capa_usuario || null,
        usuario.nm_senha_usuario,
        usuario.ds_biografia_usuario || null,
        usuario.dt_perfil_usuario,
        usuario.cd_apelido_usuario, // qual usuário será atualizado
      ]
    );

    console.log("✅ Usuário atualizado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error.message);
  }
}
