import { decodeBase64 } from "bcryptjs";
import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableDenunciaComentario() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS DENUNCIA_COMENTARIO (
        idDenunciaComentario INTEGER PRIMARY KEY AUTOINCREMENT,
        idComentario INTEGER NOT NULL,
        apelido VARCHAR(30) NOT NULL,
        idCategoriaDenuncia INTEGER NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
        apelidoAdmin VARCHAR(30),
        dataRevisao DATETIME,
        status VARCHAR(50) NOT NULL DEFAULT "Aguardando revisão dos administradores", 
        FOREIGN KEY (idComentario) REFERENCES COMENTARIO(idComentario),
        FOREIGN KEY (apelido) REFERENCES USUARIO(apelido),
        FOREIGN KEY (idCategoriaDenuncia) REFERENCES CATEGORIA_DENUNCIA(idCategoriaDenuncia),
        FOREIGN KEY (apelidoAdmin) REFERENCES USUARIO(apelido)
      );
    `);

    console.log(chalk.green("Tabela DENUNCIA_COMENTARIO criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela DENUNCIA_COMENTARIO:", error.message));
  }
}

export async function verificaDenunciaComentario(idComentario, apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_comentario
       WHERE idComentario = ?
         AND apelido = ?`,
      [idComentario, apelido]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function insertDenunciaComentario(categoriaDenunciaSelecionada, denuncia, idComentario, apelido) {
  try {
    await db.run(
      `INSERT INTO denuncia_comentario 
                (idCategoriaDenuncia, descricao, idComentario, apelido) 
                VALUES (?, ?, ?, ?)`,
      [
        categoriaDenunciaSelecionada,
        denuncia, 
        idComentario, 
        apelido
      ]
    );

    console.log(chalk.green("Denúncia do comentário inserida com sucesso!"));
    return { statusCode: 200, message: "Denúncia do comentário inserida com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir denúncia de comentário:", error.message));
    return { statusCode: 500, message: "Erro ao inserir denúncia de comentário!"};
  }
}

export async function contaDenunciasComentario(idComentario) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_COMENTARIO
       WHERE idComentario = ?;`,
      [idComentario]
    );

    console.log(chalk.green("Contagem de denúncias do comentário realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias do comentário realizada com sucesso!",
      quantidadeDenunciasComentario: countResult.total
    };

  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias do comentário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias do comentário!",
      quantidadeDenunciasComentario: 0
    };
  }
}

export async function contaDenunciasComentarioPendentes(idComentario) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_COMENTARIO
       WHERE idComentario = ?
         AND status = "Aguardando revisão dos administradores";`,
      [idComentario]
    );

    console.log(chalk.green("Contagem de denúncias pendentes realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias pendentes realizada com sucesso!",
      quantidadeDenunciasComentarioPendentes: countResult.total
    };

  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias pendentes do comentário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias pendentes do comentário!",
      quantidadeDenunciasComentarioPendentes: 0
    };
  }
}

export async function selectDenunciasComentarioAdmin(idComentario, paginaDenunciasComentario, limite) {
  try {
    const offset = (paginaDenunciasComentario - 1) * limite;

    const rows = await db.all(
      `SELECT 
        C.idNoticia, 
        DC.idDenunciaComentario, 
        DC.idCategoriaDenuncia,
        CD.categoria AS categoria,
        DC.descricao,
        datetime(DC.dataDenuncia, 'localtime') AS dataDenuncia,
        DC.apelidoAdmin,
        datetime(DC.dataRevisao, 'localtime') AS dataRevisao,
        DC.status,
        DC.idComentario, 
        DC.apelido,
        UD.apelido AS apelido,
        IP.imagem AS fotoPerfil
      FROM DENUNCIA_COMENTARIO DC
      INNER JOIN USUARIO UD 
        ON DC.apelido = UD.apelido
      LEFT JOIN IMAGEM IP 
        ON UD.apelido = IP.apelido 
        AND IP.identificador = "Ícone"
      LEFT JOIN CATEGORIA_DENUNCIA CD 
        ON DC.idCategoriaDenuncia = CD.idCategoriaDenuncia 
      INNER JOIN COMENTARIO C
        ON DC.idComentario = C.idComentario
      WHERE DC.idComentario = ?
      ORDER BY 
        (DC.status = 'Aprovada') DESC, 
        DC.dataDenuncia DESC
      LIMIT ? OFFSET ?`,
      [idComentario, limite, offset]
    );

    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    const denuncias = rows.map(denuncia => ({
      idDenunciaComentario: denuncia.idDenunciaComentario,
      idCategoriaDenuncia: denuncia.idCategoriaDenuncia,
      idNoticia: denuncia.idNoticia,
      categoria: denuncia.categoria,
      descricao: denuncia.descricao,
      dataDenuncia: denuncia.dataDenuncia,
      apelidoAdmin: denuncia.apelidoAdmin,
      dataRevisao: denuncia.dataRevisao,
      status: denuncia.status,
      idComentario: denuncia.idComentario,
      apelido: denuncia.apelido,
      fotoPerfil: blobToDataURI(denuncia.fotoPerfil)
    }));

    console.log(chalk.green("Denúncias do comentário capturadas com sucesso!"));
    
    return {
      statusCode: 200,
      message: "Denúncias do comentário capturadas com sucesso!",
      denuncias
    };

  } catch (error) {
    console.error(chalk.red("Erro ao capturar denúncias do comentário:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao capturar denúncias do comentário!",
      denuncias: []
    };
  }
}

export async function updateAprovarDenunciaComentario(idDenunciaComentario, apelidoAdmin) {
  try {
    await db.run(
      `UPDATE denuncia_comentario
       SET apelidoAdmin = ?, 
           dataRevisao = datetime('now', 'localtime'),
           status = ?
       WHERE idDenunciaComentario = ?`,
      [
        apelidoAdmin,
        "Aprovada",
        idDenunciaComentario
      ]
    );

    console.log(chalk.green("Denúncia comentário aprovada com sucesso!"));
    return { statusCode: 200, message: "Denúncia comentário aprovada com sucesso!" };

  } catch (error) {
    console.error(chalk.red("Erro ao aprovar denúncia comentário:", error.message));
    return { statusCode: 500, message: "Erro ao aprovar denúncia comentário!" };
  }
}

export async function verificaDenunciaComentarioPorId(idDenunciaComentario) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_comentario
       WHERE idDenunciaComentario = ?`,
      [idDenunciaComentario]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function deleteDenunciaComentario(idDenunciaComentario) {
  try {
    await db.run(
      `DELETE FROM denuncia_comentario 
       WHERE idDenunciaComentario = ?`,
       [
        idDenunciaComentario
       ]
      );
    console.log(chalk.green(`A denúncia comentário '${idDenunciaComentario}' foi deletada com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao excluir denúncia comentário:", error.message));
  }
}

export async function deleteTodasDenunciasComentarioPorId(idComentario) {
  try {
    await db.run(
      `DELETE FROM denuncia_comentario
       WHERE idComentario = ?`,
       [
        idComentario
       ]
      );
    console.log(chalk.green(`Todas as denúncias comentário atreladas ao comentário '${idComentario}' foram deletadas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao excluir denúncias comentário atreladas ao comentário:", error.message));
  }
}