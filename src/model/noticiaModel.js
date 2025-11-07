import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableNoticia() {
    try {
      
      await db.exec(
        `CREATE TABLE IF NOT EXISTS NOTICIA ( 
          idNoticia INTEGER PRIMARY KEY AUTOINCREMENT,
          legenda VARCHAR(5000) NOT NULL,
          dataNoticia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          apelido VARCHAR(30) NOT NULL,
          siglaBairro VARCHAR(3) NOT NULL,
          desativado INTEGER NOT NULL DEFAULT 0, 
          status VARCHAR(50) NOT NULL DEFAULT "null", 
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
                (legenda, apelido, siglaBairro) 
                VALUES (?, ?, ?)`,
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
      message: "Notícia inserida com sucesso!",
    };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir notícia:", error.message));
    return {
      idNoticia: 0,
      statusCode: 500,
      message: "Erro ao inserir notícia!"
    };
  }
}

export async function updateNoticia(noticia) {
  try {
    const result = await db.run(
      `UPDATE noticia 
       SET legenda = ?, 
           siglaBairro = ?
       WHERE idNoticia = ?`,
      [
        noticia.ds_noticia,
        noticia.sg_bairro,
        noticia.idNoticia
      ]
    );

    if (result.changes === 0) {
      console.warn(chalk.yellow("Nenhuma notícia foi atualizada. Verifique o ID."));
      return {
        statusCode: 404,
        message: "Nenhuma notícia encontrada com esse ID.",
      };
    }

    console.log(chalk.green("Notícia atualizada com sucesso!"));
    return {
      statusCode: 200,
      message: "Notícia atualizada com sucesso!",
    };

  } catch (error) {
    console.error(chalk.red("Erro ao atualizar notícia:", error.message));
    return {
      statusCode: 500,
      message: "Erro ao atualizar notícia!",
    };
  }
}

export async function selectNoticias(pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
          N.idNoticia,
          N.legenda,
          datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
          N.apelido,
          N.siglaBairro,
          B.nomeBairro, 
          N.status, 
          I.idImagem,
          I.imagem,
          U.nome AS nomeUsuario,
          U.email AS emailUsuario
        FROM NOTICIA AS N
        INNER JOIN BAIRRO AS B ON N.siglaBairro = B.siglaBairro
        INNER JOIN USUARIO AS U ON N.apelido = U.apelido
        LEFT JOIN IMAGEM AS I 
          ON N.idNoticia = I.idNoticia 
          AND I.identificador = ?
        WHERE 
          N.desativado = 0
          AND U.desativado = 0
        ORDER BY 
          N.idNoticia DESC
        LIMIT ? OFFSET ?`,
      ["Notícia", limite, offset]
    );

    // Consulta para contar o total de notícias (sem se preocupar com imagens)
    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM NOTICIA WHERE desativado = 0`
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
          imagens: [],
          status: row.status
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
    console.error("Erro ao capturar notícias:", error.message);
    return { noticias: [], totalNoticias: 0 };
  }
}

export async function selectNoticiasDoUsuario(apelido, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
          N.idNoticia,
          N.legenda,
          datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
          N.apelido,
          N.siglaBairro,
          B.nomeBairro,
          N.status, 
          I.idImagem,
          I.imagem,
          U.nome AS nomeUsuario,
          U.email AS emailUsuario
        FROM NOTICIA AS N
        INNER JOIN BAIRRO AS B ON N.siglaBairro = B.siglaBairro
        INNER JOIN USUARIO AS U ON N.apelido = U.apelido
        LEFT JOIN IMAGEM AS I 
          ON N.idNoticia = I.idNoticia 
          AND I.identificador = ?
        WHERE 
          N.apelido = ?
          AND N.desativado = 0
          AND U.desativado = 0
        ORDER BY 
          N.idNoticia DESC
        LIMIT ? OFFSET ?`,
      ["Notícia", apelido, limite, offset]
    );

    // Consulta para contar o total de notícias (sem se preocupar com imagens)
    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM NOTICIA WHERE apelido = ? AND desativado = 0`,
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
          imagens: [],
          status: row.status
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
        datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
        N.apelido,
        N.siglaBairro,
        B.nomeBairro,
        I.idImagem,
        I.imagem
      FROM NOTICIA N
      JOIN BAIRRO B ON N.siglaBairro = B.siglaBairro
      LEFT JOIN IMAGEM I ON N.idNoticia = I.idNoticia AND I.identificador = ?
      WHERE N.idNoticia = ? AND N.apelido = ? AND N.desativado = 0`,
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

export async function selectIdsNoticiasPorApelido(apelido) {
  try {
    const rows = await db.all(
      `SELECT 
        N.idNoticia
      FROM NOTICIA N
      WHERE N.apelido = ?`,
      [apelido]
    );

    if (!rows || rows.length === 0) {
      return [];
    }

    const arrayIdsNoticias = rows.map(row => row.idNoticia);
    return arrayIdsNoticias;
  } catch (error) {
    console.error("Erro ao capturar IDs de notícias por apelido:", error.message);
    return [];
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

export async function verificaNoticia(idNoticia) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count
       FROM noticia
       WHERE idNoticia = ?`,
      [idNoticia]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function selectNoticiasPesquisadas(busca, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
          N.idNoticia,
          N.legenda,
          datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
          N.apelido,
          N.siglaBairro,
          B.nomeBairro,
          N.status, 
          I.idImagem,
          I.imagem,
          U.nome AS nomeUsuario,
          U.email AS emailUsuario
        FROM NOTICIA AS N
        INNER JOIN BAIRRO AS B ON N.siglaBairro = B.siglaBairro
        INNER JOIN USUARIO AS U ON N.apelido = U.apelido
        LEFT JOIN IMAGEM AS I 
          ON N.idNoticia = I.idNoticia 
          AND I.identificador = ?
        WHERE 
          N.legenda LIKE ?
          AND N.desativado = 0
          AND U.desativado = 0
        ORDER BY 
          N.idNoticia DESC
        LIMIT ? OFFSET ?`,
      ["Notícia", `%${busca}%`, limite, offset]
    );

    // Consulta para contar o total de notícias (sem se preocupar com imagens)
    const countResult = await db.get(
      `SELECT COUNT(*) as total
       FROM NOTICIA 
       WHERE legenda LIKE ? AND desativado = 0`,
       [`%${busca}%`]
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
          imagens: [],
          status: row.status
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
    console.error("Erro ao pesquisar notícias:", error.message);
    return { noticias: [], totalNoticias: 0 };
  }
}

export async function selectNoticiasAdmin(pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    // Consulta principal: notícias + imagens + denúncias
    const rows = await db.all(
        `SELECT 
          N.idNoticia,
          N.legenda,
          datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
          N.apelido,
          N.siglaBairro,
          B.nomeBairro, 
          N.status,
          N.desativado,
          U.desativado AS usuarioDesativado,
          I.idImagem,
          I.imagem,
          COUNT(DN.idDenunciaNoticia) AS totalDenuncias
        FROM NOTICIA N
        JOIN BAIRRO B 
          ON N.siglaBairro = B.siglaBairro
        JOIN USUARIO U 
          ON N.apelido = U.apelido
        LEFT JOIN IMAGEM I 
          ON N.idNoticia = I.idNoticia 
          AND I.identificador = "Notícia"
        LEFT JOIN DENUNCIA_NOTICIA DN 
          ON N.idNoticia = DN.idNoticia
        GROUP BY 
          N.idNoticia, 
          N.legenda, 
          N.dataNoticia, 
          N.apelido,
          N.desativado, 
          N.siglaBairro, 
          B.nomeBairro, 
          N.status, 
          I.idImagem, 
          I.imagem
        ORDER BY 
          totalDenuncias DESC, 
          N.dataNoticia DESC
        LIMIT ? OFFSET ?;`,
        [limite, offset]
      );

    // Contar total de notícias
    const countResult = await db.get(
      `SELECT COUNT(*) AS total FROM NOTICIA`
    );

    // Conversor de Blob → Data URI
    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    // Agrupar notícias (para juntar múltiplas imagens)
    const noticiasMap = new Map();

    for (const row of rows) {
      if (!noticiasMap.has(row.idNoticia)) {
        noticiasMap.set(row.idNoticia, {
          idNoticia: row.idNoticia,
          legenda: row.legenda,
          dataNoticia: row.dataNoticia,
          apelido: row.apelido,
          usuarioDesativado: row.usuarioDesativado,
          desativado: row.desativado,
          siglaBairro: row.siglaBairro,
          nomeBairro: row.nomeBairro,
          status: row.status,
          totalDenuncias: row.totalDenuncias,
          imagens: []
        });
      }

      // Adicionar imagem (caso exista)
      if (row.idImagem && row.imagem) {
        noticiasMap.get(row.idNoticia).imagens.push({
          idImagem: row.idImagem,
          imagem: blobToDataURI(row.imagem)
        });
      }
    }

    return {
      noticias: Array.from(noticiasMap.values()),
      totalNoticias: countResult.total
    };

  } catch (error) {
    console.error("Erro ao capturar notícias (admin):", error.message);
    return { noticias: [], totalNoticias: 0 };
  }
}

export async function selectNoticiasPesquisadasAdmin(busca, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
        N.idNoticia,
        N.legenda,
        datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
        N.apelido,
        N.siglaBairro,
        B.nomeBairro,
        N.desativado,
        U.desativado AS usuarioDesativado,
        N.status, 
        I.idImagem,
        I.imagem
      FROM NOTICIA N
      JOIN BAIRRO B ON N.siglaBairro = B.siglaBairro 
      JOIN USUARIO AS U ON N.apelido = U.apelido 
      LEFT JOIN IMAGEM I ON N.idNoticia = I.idNoticia AND I.identificador = ?
      WHERE N.legenda LIKE ? 
      ORDER BY N.idNoticia DESC
      LIMIT ? OFFSET ?`,
      ["Notícia", `%${busca}%`, limite, offset]
    );

    // Consulta para contar o total de notícias (sem se preocupar com imagens)
    const countResult = await db.get(
      `SELECT COUNT(*) as total
       FROM NOTICIA 
       WHERE legenda LIKE ?`,
       [`%${busca}%`]
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
          desativado: row.desativado,
          usuarioDesativado: row.usuarioDesativado,
          imagens: [],
          status: row.status
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
    console.error("Erro ao pesquisar notícias:", error.message);
    return { noticias: [], totalNoticias: 0 };
  }
}

export async function updateDesativarNoticia(idNoticia) {
  try {
    await db.run(
      `UPDATE noticia 
                SET desativado = ?
                WHERE idNoticia = ?`,
      [
        1,
        idNoticia
      ]
    );

    console.log(chalk.green("Notícia desativada com sucesso!"));
    return { statusCode: 200, message: "Notícia desativada com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao desativar notícia:", error.message));
    return { statusCode: 500, message: "Erro ao desativar notícia!" };
  }
}

export async function updateAtivarNoticia(idNoticia) {
  try {
    await db.run(
      `UPDATE noticia 
                SET desativado = ?
                WHERE idNoticia = ?`,
      [
        0,
        idNoticia
      ]
    );

    console.log(chalk.green("Notícia ativada com sucesso!"));
    return { statusCode: 200, message: "Notícia ativada com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao ativar notícia:", error.message));
    return { statusCode: 500, message: "Erro ao ativar notícia!" };
  }
}

export async function updateStatusNoticia(idNoticia, status) {
  try {
    await db.run(
      `UPDATE noticia 
                SET status = ?
                WHERE idNoticia = ?`,
      [
        status,
        idNoticia
      ]
    );

    console.log(chalk.green("Status da notícia atualizado com sucesso!"));
    return { statusCode: 200, message: "Status da notícia atualizado com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao atualizar status da notícia:", error.message));
    return { statusCode: 500, message: "Erro ao atualizar status da notícia!" };
  }
}

export async function selectNoticiaAdmin(idNoticia) {
  try {
    const rows = await db.all(
      `SELECT 
        N.idNoticia,
        N.legenda, 
        N.desativado,
        N.status, 
        datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
        N.apelido,
        N.siglaBairro,
        B.nomeBairro,
        I.idImagem,
        I.imagem
      FROM NOTICIA N
      JOIN BAIRRO B ON N.siglaBairro = B.siglaBairro
      LEFT JOIN IMAGEM I ON N.idNoticia = I.idNoticia AND I.identificador = ?
      WHERE N.idNoticia = ?`,
      ["Notícia", idNoticia]
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
      status: primeira.status,
      dataNoticia: primeira.dataNoticia,
      apelido: primeira.apelido,
      siglaBairro: primeira.siglaBairro,
      nomeBairro: primeira.nomeBairro,
      desativado: primeira.desativado,
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
    console.error("Erro ao capturar notícia por ID:", error.message);
    return null;
  }
}

export async function selectNoticia(idNoticia) {
  try {
    const rows = await db.all(
      `SELECT 
          N.idNoticia,
          N.legenda,
          datetime(N.dataNoticia, 'localtime') AS dataNoticia, 
          N.apelido,
          N.siglaBairro,
          B.nomeBairro, 
          N.status, 
          I.idImagem,
          I.imagem,
          U.nome AS nomeUsuario,
          U.email AS emailUsuario
        FROM NOTICIA AS N
        INNER JOIN BAIRRO AS B ON N.siglaBairro = B.siglaBairro
        INNER JOIN USUARIO AS U ON N.apelido = U.apelido
        LEFT JOIN IMAGEM AS I 
          ON N.idNoticia = I.idNoticia 
          AND I.identificador = ?
        WHERE 
          N.desativado = 0
          AND U.desativado = 0 
          AND N.idNoticia = ?
        ORDER BY 
          N.idNoticia DESC`,
      ["Notícia", idNoticia]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    function blobToDataURI(blobBuffer, mimeType = 'image/jpeg') {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }

    const primeira = rows[0];

    const noticia = {
      idNoticia: primeira.idNoticia,
      legenda: primeira.legenda,
      status: primeira.status,
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
    console.error("Erro ao capturar notícias:", error.message);
    return null;
  }
}