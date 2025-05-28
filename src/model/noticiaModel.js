import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableNoticia() {
    try {
      
      await db.exec(
        `CREATE TABLE IF NOT EXISTS NOTICIA ( 
          idNoticia INTEGER PRIMARY KEY AUTOINCREMENT,
          legenda VARCHAR(200) NOT NULL,
          dataNoticia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          apelido VARCHAR(15) NOT NULL,
          siglaBairro VARCHAR(3) NOT NULL,
          FOREIGN KEY(apelido) REFERENCES USUARIO(apelido),
          FOREIGN KEY(siglaBairro) REFERENCES BAIRRO(siglaBairro)
        );`
      );
  
      console.log(chalk.green("Tabela NOTICIA criada com sucesso!"));
    } catch (error) {
      console.error(chalk.red("Erro ao criar a tabela NOTICIA:", error.message));
    }
  }

export async function insertNoticia(noticia) {
  try {
    const result = await db.run(
      `INSERT INTO noticia 
                (legenda, dataNoticia, apelido, siglaBairro) 
                VALUES (?, CURRENT_TIMESTAMP, ?, ?)`,
      [
        noticia.ds_noticia,
        noticia.apelido,
        noticia.sg_bairro,
      ]
    );

    const idNoticia = result.lastID;

    console.log(chalk.green("Notícia inserida com sucesso!"));
    return {
      idNoticia: idNoticia,
      statusCode: 200,
      message: "✅ Notícia inserida com sucesso!",
    };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir notícia:", error.message));
    return {
      idNoticia: 0,
      statusCode: 500,
      message: "❌ Erro ao inserir notícia: " + error.message,
    };
  }
}

export async function updateNoticia(noticia) {
  try {
    const now = new Date();
    const nowLocal = now.getFullYear() +
        '-' + String(now.getMonth() + 1).padStart(2, '0') +
        '-' + String(now.getDate()).padStart(2, '0') +
        ' ' + String(now.getHours()).padStart(2, '0') +
        ':' + String(now.getMinutes()).padStart(2, '0') +
        ':' + String(now.getSeconds()).padStart(2, '0');

    const result = await db.run(
      `UPDATE noticia 
       SET legenda = ?, 
           dataNoticia = ?, 
           siglaBairro = ?
       WHERE idNoticia = ?`,
      [
        noticia.ds_noticia,
        nowLocal,
        noticia.sg_bairro,
        noticia.idNoticia
      ]
    );

    if (result.changes === 0) {
      console.warn(chalk.yellow("⚠️ Nenhuma notícia foi atualizada. Verifique o ID."));
      return {
        statusCode: 404,
        message: "⚠️ Nenhuma notícia encontrada com esse ID.",
      };
    }

    console.log(chalk.green("✅ Notícia atualizada com sucesso!"));
    return {
      statusCode: 200,
      message: "✅ Notícia atualizada com sucesso!",
    };

  } catch (error) {
    console.error(chalk.red("❌ Erro ao atualizar notícia:", error.message));
    return {
      statusCode: 500,
      message: "❌ Erro ao atualizar notícia: " + error.message,
    };
  }
}

export async function selectNoticiasDoUsuario(apelido, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
        N.idNoticia,
        N.legenda,
        N.dataNoticia,
        N.apelido,
        N.siglaBairro,
        B.nomeBairro,
        I.idImagem,
        I.imagem
      FROM NOTICIA N
      JOIN BAIRRO B ON N.siglaBairro = B.siglaBairro
      LEFT JOIN IMAGEM I ON N.idNoticia = I.idNoticia AND I.identificador = ?
      WHERE N.apelido = ?
      ORDER BY N.idNoticia DESC
      LIMIT ? OFFSET ?`,
      ["Notícia", apelido, limite, offset]
    );

    // Consulta para contar o total de notícias (sem se preocupar com imagens)
    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM NOTICIA WHERE apelido = ?`,
      [apelido]
    );

    // Utilitário para converter blob em Data URI
    function blobToDataURI(blobBuffer, mimeType = 'image/jpeg') {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }

    // Agrupar notícias pelo id usando Map
    const noticiasMap = new Map();

    for (const row of rows) {
      if (!noticiasMap.has(row.idNoticia)) {
        noticiasMap.set(row.idNoticia, {
          idNoticia: row.idNoticia,
          legenda: row.legenda,
          dataNoticia: row.dataNoticia,
          apelido: row.apelido,
          siglaBairro: row.siglaBairro,
          nomeBairro: row.nomeBairro,
          imagens: []
        });
      }

      // Se tiver imagem, adiciona ao array de imagens
      if (row.idImagem && row.imagem) {
        noticiasMap.get(row.idNoticia).imagens.push({
          idImagem: row.idImagem,
          imagem: blobToDataURI(row.imagem),
        });
      }
    }

    return {
      noticias: Array.from(noticiasMap.values()),
      totalNoticias: countResult.total
    };

  } catch (error) {
    console.error("Erro ao capturar notícias do usuário:", error.message);
    return { noticias: [], totalNoticias: 0 };
  }
}

export async function selectNoticiaPorIdEApelido(idNoticia, apelido) {
  try {
    const rows = await db.all(
      `SELECT 
        N.idNoticia,
        N.legenda,
        N.dataNoticia,
        N.apelido,
        N.siglaBairro,
        B.nomeBairro,
        I.idImagem,
        I.imagem
      FROM NOTICIA N
      JOIN BAIRRO B ON N.siglaBairro = B.siglaBairro
      LEFT JOIN IMAGEM I ON N.idNoticia = I.idNoticia AND I.identificador = ?
      WHERE N.idNoticia = ? AND N.apelido = ?`,
      ["Notícia", idNoticia, apelido]
    );

    if (!rows || rows.length === 0) {
      return null; // Notícia não encontrada ou não pertence ao apelido
    }

    function blobToDataURI(blobBuffer, mimeType = 'image/jpeg') {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }

    const primeira = rows[0]; // Todos os dados da notícia são iguais em cada linha

    const noticia = {
      idNoticia: primeira.idNoticia,
      legenda: primeira.legenda,
      dataNoticia: primeira.dataNoticia,
      apelido: primeira.apelido,
      siglaBairro: primeira.siglaBairro,
      nomeBairro: primeira.nomeBairro,
      imagens: []
    };

    for (const row of rows) {
      if (row.idImagem && row.imagem) {
        noticia.imagens.push({
          idImagem: row.idImagem,
          imagem: blobToDataURI(row.imagem),
        });
      }
    }

    return noticia;

  } catch (error) {
    console.error("Erro ao capturar notícia por ID e apelido:", error.message);
    return null;
  }
}

export async function deleteNoticia(idNoticia) {
  try {
    await db.run(
      `DELETE FROM NOTICIA WHERE idNoticia = ?`,
      [idNoticia]);
    console.log(chalk.green(`Notícia ${idNoticia} apagada com sucesso!`));
  } catch (error) {
    console.error(chalk.red(`Erro ao apagar notícia: '${error.message}'`));
  }
}

export async function deleteNoticiasUsuario(apelido) {
  try {
    await db.run(
      `DELETE FROM NOTICIA WHERE apelido = ?`,
      [apelido]);
    console.log(chalk.green(`Notícias de ${apelido} apagadas com sucesso!`));
  } catch (error) {
    console.error(chalk.red(`Erro ao apagar notícias: '${error.message}'`));
  }
}
