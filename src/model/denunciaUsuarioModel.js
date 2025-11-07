import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableDenunciaUsuario() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS DENUNCIA_USUARIO (
        idDenunciaUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
        apelidoDenunciado VARCHAR(30) NOT NULL,
        apelido VARCHAR(30) NOT NULL,
        idCategoriaDenuncia INTEGER NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
        apelidoAdmin VARCHAR(30),
        dataRevisao DATETIME,
        status VARCHAR(50) NOT NULL DEFAULT "Aguardando revisão dos administradores", 
        FOREIGN KEY (apelidoDenunciado) REFERENCES USUARIO(apelido),
        FOREIGN KEY (apelido) REFERENCES USUARIO(apelido),
        FOREIGN KEY (idCategoriaDenuncia) REFERENCES CATEGORIA_DENUNCIA(idCategoriaDenuncia),
        FOREIGN KEY (apelidoAdmin) REFERENCES USUARIO(apelido)
      );
    `);

    console.log(chalk.green("Tabela DENUNCIA_USUARIO criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela DENUNCIA_USUARIO:", error.message));
  }
}

export async function verificaDenunciaUsuario(apelidoDenunciado, apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_usuario
       WHERE apelidoDenunciado = ?
         AND apelido = ?`,
      [apelidoDenunciado, apelido]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function insertDenunciaUsuario(categoriaDenunciaSelecionada, denuncia, apelidoDenunciado, apelido) {
  try {
    await db.run(
      `INSERT INTO denuncia_usuario 
                (idCategoriaDenuncia, descricao, apelidoDenunciado, apelido) 
                VALUES (?, ?, ?, ?)`,
      [
        categoriaDenunciaSelecionada,
        denuncia, 
        apelidoDenunciado, 
        apelido
      ]
    );

    console.log(chalk.green("Denúncia de usuário inserida com sucesso!"));
    return { statusCode: 200, message: "Denúncia de usuário inserida com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir denúncia de usuário:", error.message));
    return { statusCode: 500, message: "Erro ao inserir denúncia de usuário!"};
  }
}

export async function contaDenunciasUsuarioAprovadas(apelido) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_USUARIO DU
       INNER JOIN USUARIO U
         ON DU.apelidoDenunciado = U.apelido
       WHERE DU.apelidoDenunciado = ?
         AND DU.status = "Aprovada"
         AND U.admin = ?;`,
      [apelido, 0]
    );

    console.log(chalk.green("Contagem de denúncias aprovadas realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias aprovadas realizada com sucesso!",
      quantidadeDenunciasUsuarioAprovadas: countResult.total
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias aprovadas do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias aprovadas do usuário!",
      quantidadeDenunciasUsuarioAprovadas: 0
    };
  }
}

export async function contaDenunciasUsuarioPendentes(apelido) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_USUARIO DU
       INNER JOIN USUARIO U
         ON DU.apelidoDenunciado = U.apelido
       WHERE DU.apelidoDenunciado = ?
         AND DU.status = "Aguardando revisão dos administradores"
         AND U.admin = ?;`,
      [apelido, 0]
    );

    console.log(chalk.green("Contagem de denúncias pendentes realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias pendentes realizada com sucesso!",
      quantidadeDenunciasUsuarioPendentes: countResult.total
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias pendentes do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias pendentes do usuário!",
      quantidadeDenunciasUsuarioPendentes: 0
    };
  }
}

export async function contaDenunciasUsuario(apelido) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_USUARIO DU
       INNER JOIN USUARIO U
         ON DU.apelidoDenunciado = U.apelido
       WHERE DU.apelidoDenunciado = ?
         AND U.admin = ?;`,
      [apelido, 0]
    );

    console.log(chalk.green("Contagem de denúncias realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias realizada com sucesso!",
      quantidadeDenunciasUsuario: countResult.total
    };
  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias do usuário!",
      quantidadeDenunciasUsuario: 0
    };
  }
}

export async function selectDenunciasUsuarioAdmin(apelido, paginaDenunciasUsuario, limite) {
  try {
    const offset = (paginaDenunciasUsuario - 1) * limite;

    const rows = await db.all(
      `SELECT 
        DU.idDenunciaUsuario, 
        DU.idCategoriaDenuncia,
        CD.categoria AS categoria,
        DU.descricao,
        datetime(DU.dataDenuncia, 'localtime') AS dataDenuncia,
        DU.apelidoAdmin,
        datetime(DU.dataRevisao, 'localtime') AS dataRevisao,
        DU.status,
        DU.apelidoDenunciado, 
        DU.apelido,
        UD.apelido AS apelido,
        IP.imagem AS fotoPerfil
      FROM DENUNCIA_USUARIO DU
      INNER JOIN USUARIO UD 
        ON DU.apelido = UD.apelido
      LEFT JOIN IMAGEM IP 
        ON UD.apelido = IP.apelido 
        AND IP.identificador = "Ícone"
      LEFT JOIN CATEGORIA_DENUNCIA CD 
        ON DU.idCategoriaDenuncia = CD.idCategoriaDenuncia
      WHERE DU.apelidoDenunciado = ?
      ORDER BY 
        (DU.status = 'Aprovada') DESC, 
        DU.dataDenuncia DESC
      LIMIT ? OFFSET ?`,
      [apelido, limite, offset]
    );

    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    const denuncias = rows.map(denuncia => ({
      idDenunciaUsuario: denuncia.idDenunciaUsuario,
      idCategoriaDenuncia: denuncia.idCategoriaDenuncia,
      categoria: denuncia.categoria,
      descricao: denuncia.descricao,
      dataDenuncia: denuncia.dataDenuncia,
      apelidoAdmin: denuncia.apelidoAdmin,
      dataRevisao: denuncia.dataRevisao,
      status: denuncia.status,
      apelidoDenunciado: denuncia.apelidoDenunciado,
      apelido: denuncia.apelido,
      fotoPerfil: blobToDataURI(denuncia.fotoPerfil)
    }));

    console.log(chalk.green("Denúncias do usuário capturadas com sucesso!"));
    
    return {
      statusCode: 200,
      message: "Denúncias do usuário capturadas com sucesso!",
      denuncias
    };

  } catch (error) {
    console.error(chalk.red("Erro ao capturar denúncias do usuário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao capturar denúncias do usuário!",
      denuncias: []
    };
  }
}

export async function updateAprovarDenunciaUsuario(idDenunciaUsuario, apelidoAdmin) {
  try {
    await db.run(
      `UPDATE denuncia_usuario
       SET apelidoAdmin = ?, 
           dataRevisao = datetime('now', 'localtime'),
           status = ?
       WHERE idDenunciaUsuario = ?`,
      [
        apelidoAdmin,
        "Aprovada",
        idDenunciaUsuario
      ]
    );

    console.log(chalk.green("Denúncia usuário aprovada com sucesso!"));
    return { statusCode: 200, message: "Denúncia usuário aprovada com sucesso!" };

  } catch (error) {
    console.error(chalk.red("Erro ao aprovar denúncia usuário:", error.message));
    return { statusCode: 500, message: "Erro ao aprovar denúncia usuário!" };
  }
}

export async function verificaDenunciaUsuarioPorId(idDenunciaUsuario) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_usuario
       WHERE idDenunciaUsuario = ?`,
      [idDenunciaUsuario]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function deleteDenunciaUsuario(idDenunciaUsuario) {
  try {
    await db.run(
      `DELETE FROM denuncia_usuario 
       WHERE idDenunciaUsuario = ?`,
       [
        idDenunciaUsuario
       ]
      );
    console.log(chalk.green(`A denúncia usuário '${idDenunciaUsuario}' foi deletada com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao excluir denúncia usuário:", error.message));
  }
}

export async function deleteTodasDenunciasUsuarioPorApelido(apelido) {
  try {
    await db.run(
      `DELETE FROM denuncia_usuario
       WHERE apelidoDenunciado = ? 
       OR apelido = ?`,
       [
        apelido,
        apelido
       ]
      );
    console.log(chalk.green(`Todas as denúncias usuário atreladas ao usuário '${apelido}' foram deletadas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao excluir denúncias usuário atreladas ao usuário:", error.message));
  }
}