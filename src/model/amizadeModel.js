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
    console.error(chalk.red("Erro ao excluir amizades do usuário:", error.message));
  }
}

export async function contaSeguidores(apelido) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM AMIZADE A
        INNER JOIN USUARIO U
        ON A.apelido1 = U.apelido 
       WHERE A.apelido2 = ? 
         AND U.admin = ? 
         AND U.desativado = 0`,
      [apelido, 0]
    );

    console.log(chalk.green("Contagem de seguidores realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de seguidores realizada com sucesso!",
      quantidadeSeguidores: countResult.total
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
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM AMIZADE A
        INNER JOIN USUARIO U
        ON A.apelido2 = U.apelido 
       WHERE A.apelido1 = ? 
         AND U.admin = ? 
         AND U.desativado = 0`,
      [apelido, 0]
    );

    console.log(chalk.green("Contagem de seguindo realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de seguindo realizada com sucesso!",
      quantidadeSeguindo: countResult.total
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

export async function selectSeguidores(apelido, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
        U.apelido, 
        IP.imagem AS fotoPerfil
      FROM USUARIO U
      LEFT JOIN IMAGEM IP 
        ON U.apelido = IP.apelido AND IP.identificador = "Ícone" 
      INNER JOIN AMIZADE A
        ON A.apelido1 = U.apelido
      WHERE A.apelido2 = ? 
        AND U.admin = ? 
      ORDER BY U.apelido DESC 
      LIMIT ? OFFSET ?`,
      [apelido, 0, limite, offset]
    );

    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM AMIZADE A
        INNER JOIN USUARIO U
        ON A.apelido1 = U.apelido 
       WHERE A.apelido2 = ? 
         AND U.admin = ?;`,
      [apelido, 0]
    );

    // Função para converter BLOB (Buffer) em data URI base64
    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    // Aguarda todos os mapeamentos
    const seguidores = await Promise.all(
      rows.map(async seguidor => ({
        apelido: seguidor.apelido,
        fotoPerfil: blobToDataURI(seguidor.fotoPerfil),
        usuario1SegueUsuario2: await verificaAmizade(apelido, seguidor.apelido),
        usuario2SegueUsuario1: await verificaAmizade(seguidor.apelido, apelido)
      }))
    );

    console.log(chalk.green("Captura de seguidores realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Captura de seguidores realizada com sucesso!",
      seguidores,
      totalSeguidores: countResult.total
    };
  } catch (error) {
    console.error(chalk.red("Erro ao capturar seguidores do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao capturar seguidores do usuário!",
      seguidores: [],
      totalSeguidores: 0
    };
  }
}

export async function selectSeguindo(apelido, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
        U.apelido, 
        IP.imagem AS fotoPerfil
      FROM USUARIO U
      LEFT JOIN IMAGEM IP 
        ON U.apelido = IP.apelido AND IP.identificador = "Ícone" 
      INNER JOIN AMIZADE A
        ON A.apelido2 = U.apelido
      WHERE A.apelido1 = ? 
        AND U.admin = ? 
      ORDER BY U.apelido DESC 
      LIMIT ? OFFSET ?`,
      [apelido, 0, limite, offset]
    );

    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM AMIZADE A
        INNER JOIN USUARIO U
        ON A.apelido2 = U.apelido 
       WHERE A.apelido1 = ? 
         AND U.admin = ?;`,
      [apelido, 0]
    );

    // Função para converter BLOB (Buffer) em data URI base64
    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    // Aguarda todos os mapeamentos
    const seguindo = await Promise.all(
      rows.map(async seguindo => ({
        apelido: seguindo.apelido,
        fotoPerfil: blobToDataURI(seguindo.fotoPerfil),
        usuario1SegueUsuario2: await verificaAmizade(apelido, seguindo.apelido),
        usuario2SegueUsuario1: await verificaAmizade(seguindo.apelido, apelido)
      }))
    );

    console.log(chalk.green("Captura de seguindo realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Captura de seguindo realizada com sucesso!",
      seguindo,
      totalSeguindo: countResult.total
    };
  } catch (error) {
    console.error(chalk.red("Erro ao capturar seguindo do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao capturar seguindo do usuário!",
      seguindo: [],
      totalSeguindo: 0
    };
  }
}