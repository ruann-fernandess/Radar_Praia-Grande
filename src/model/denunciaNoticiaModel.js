import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableDenunciaNoticia() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS DENUNCIA_NOTICIA (
        idDenunciaNoticia INTEGER PRIMARY KEY AUTOINCREMENT,
        idNoticia INTEGER NOT NULL,
        apelido VARCHAR(30) NOT NULL,
        idCategoriaDenuncia INTEGER NOT NULL,
        descricao VARCHAR(200) NOT NULL,
        dataDenuncia DATETIME DEFAULT CURRENT_TIMESTAMP,
        apelidoAdmin VARCHAR(30),
        dataRevisao DATETIME,
        status VARCHAR(50) NOT NULL DEFAULT "Aguardando revisão dos administradores", 
        FOREIGN KEY (idNoticia) REFERENCES NOTICIA(idNoticia),
        FOREIGN KEY (apelido) REFERENCES USUARIO(apelido),
        FOREIGN KEY (idCategoriaDenuncia) REFERENCES CATEGORIA_DENUNCIA(idCategoriaDenuncia),
        FOREIGN KEY (apelidoAdmin) REFERENCES USUARIO(apelido)
      );
    `);

    console.log(chalk.green("Tabela DENUNCIA_NOTICIA criada com sucesso!"));
  } catch (error) {
    console.error(chalk.red("Erro ao criar a tabela DENUNCIA_NOTICIA:", error.message));
  }
}

export async function verificaDenunciaNoticia(idNoticia, apelido) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_noticia
       WHERE idNoticia = ?
         AND apelido = ?`,
      [idNoticia, apelido]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function insertDenunciaNoticia(categoriaDenunciaSelecionada, denuncia, idNoticia, apelido) {
    try {
        await db.run(
            `INSERT INTO denuncia_noticia 
             (idCategoriaDenuncia, descricao, idNoticia, apelido) 
             VALUES (?, ?, ?, ?)`,
            [
                categoriaDenunciaSelecionada,
                denuncia, 
                idNoticia, 
                apelido
            ]
        );

        console.log(chalk.green("Denúncia da notícia inserida com sucesso!"));
        return {
            statusCode: 200,
            message: "Denúncia da notícia inserida com sucesso!"
        };
    } catch (error) {
        console.error(chalk.red("Erro ao inserir denúncia da notícia:", error.message));
        return {
            statusCode: 500,
            message: "Erro ao inserir denúncia da notícia!"
        };
    }
}

export async function contaDenunciasNoticiaAprovadas(idNoticia) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_NOTICIA
       WHERE idNoticia = ?
         AND status = "Aprovada";`,
      [idNoticia]
    );

    console.log(chalk.green("Contagem de denúncias aprovadas realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias aprovadas realizada com sucesso!",
      quantidadeDenunciasNoticiaAprovadas: countResult.total
    };

  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias aprovadas da notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias aprovadas da notícia!",
      quantidadeDenunciasNoticiaAprovadas: 0
    };
  }
}

export async function contaDenunciasNoticiaPendentes(idNoticia) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_NOTICIA
       WHERE idNoticia = ?
         AND status = "Aguardando revisão dos administradores";`,
      [idNoticia]
    );

    console.log(chalk.green("Contagem de denúncias pendentes realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias pendentes realizada com sucesso!",
      quantidadeDenunciasNoticiaPendentes: countResult.total
    };

  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias pendentes da notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias pendentes da notícia!",
      quantidadeDenunciasNoticiaPendentes: 0
    };
  }
}

export async function contaDenunciasNoticia(idNoticia) {
  try {
    const countResult = await db.get(
      `SELECT COUNT(*) AS total
       FROM DENUNCIA_NOTICIA
       WHERE idNoticia = ?;`,
      [idNoticia]
    );

    console.log(chalk.green("Contagem de denúncias da notícia realizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Contagem de denúncias da notícia realizada com sucesso!",
      quantidadeDenunciasNoticia: countResult.total
    };

  } catch (error) {
    console.error(chalk.red("Erro ao contar denúncias da notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao contar denúncias da notícia!",
      quantidadeDenunciasNoticia: 0
    };
  }
}

export async function selectDenunciasNoticiaAdmin(idNoticia, paginaDenunciasNoticia, limite) {
  try {
    const offset = (paginaDenunciasNoticia - 1) * limite;

    const rows = await db.all(
      `SELECT 
        DN.idDenunciaNoticia, 
        DN.idCategoriaDenuncia,
        CD.categoria AS categoria,
        DN.descricao,
        datetime(DN.dataDenuncia, 'localtime') AS dataDenuncia,
        DN.apelidoAdmin,
        datetime(DN.dataRevisao, 'localtime') AS dataRevisao,
        DN.status,
        DN.idNoticia, 
        DN.apelido,
        UD.apelido AS apelido,
        IP.imagem AS fotoPerfil
      FROM DENUNCIA_NOTICIA DN
      INNER JOIN USUARIO UD 
        ON DN.apelido = UD.apelido
      LEFT JOIN IMAGEM IP 
        ON UD.apelido = IP.apelido 
        AND IP.identificador = "Ícone"
      LEFT JOIN CATEGORIA_DENUNCIA CD 
        ON DN.idCategoriaDenuncia = CD.idCategoriaDenuncia
      WHERE DN.idNoticia = ?
      ORDER BY 
        (DN.status = 'Aprovada') DESC, 
        DN.dataDenuncia DESC
      LIMIT ? OFFSET ?`,
      [idNoticia, limite, offset]
    );

    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    const denuncias = rows.map(denuncia => ({
      idDenunciaNoticia: denuncia.idDenunciaNoticia,
      idCategoriaDenuncia: denuncia.idCategoriaDenuncia,
      categoria: denuncia.categoria,
      descricao: denuncia.descricao,
      dataDenuncia: denuncia.dataDenuncia,
      apelidoAdmin: denuncia.apelidoAdmin,
      dataRevisao: denuncia.dataRevisao,
      status: denuncia.status,
      idNoticia: denuncia.idNoticia,
      apelido: denuncia.apelido,
      fotoPerfil: blobToDataURI(denuncia.fotoPerfil)
    }));

    console.log(chalk.green("Denúncias da notícia capturadas com sucesso!"));
    
    return {
      statusCode: 200,
      message: "Denúncias da notícia capturadas com sucesso!",
      denuncias
    };

  } catch (error) {
    console.error(chalk.red("Erro ao capturar denúncias da notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao capturar denúncias da notícia!",
      denuncias: []
    };
  }
}

export async function updateAprovarDenunciaNoticia(idDenunciaNoticia, apelidoAdmin) {
  try {
    await db.run(
      `UPDATE denuncia_noticia
       SET apelidoAdmin = ?, 
           dataRevisao = datetime('now', 'localtime'),
           status = ?
       WHERE idDenunciaNoticia = ?`,
      [
        apelidoAdmin,
        "Aprovada",
        idDenunciaNoticia
      ]
    );

    console.log(chalk.green("Denúncia notícia aprovada com sucesso!"));
    return { statusCode: 200, message: "Denúncia notícia aprovada com sucesso!" };

  } catch (error) {
    console.error(chalk.red("Erro ao aprovar denúncia notícia:", error.message));
    return { statusCode: 500, message: "Erro ao aprovar denúncia notícia!" };
  }
}

export async function verificaDenunciaNoticiaPorId(idDenunciaNoticia) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM denuncia_noticia
       WHERE idDenunciaNoticia = ?`,
      [idDenunciaNoticia]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function deleteDenunciaNoticia(idDenunciaNoticia) {
  try {
    await db.run(
      `DELETE FROM denuncia_noticia 
       WHERE idDenunciaNoticia = ?`,
       [
        idDenunciaNoticia
       ]
      );
    console.log(chalk.green(`A denúncia notícia '${idDenunciaNoticia}' foi deletada com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao excluir denúncia notícia:", error.message));
  }
}

export async function deleteTodasDenunciasNoticiaPorId(idNoticia) {
  try {
    await db.run(
      `DELETE FROM denuncia_noticia
       WHERE idNoticia = ?`,
       [
        idNoticia
       ]
      );
    console.log(chalk.green(`Todas as denúncias notícia atreladas a notícia '${idNoticia}' foram deletadas com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao excluir denúncias notícias atreladas a notícia:", error.message));
  }
}