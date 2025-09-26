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
        status VARCHAR(50) DEFAULT "Aguardando revisão dos administradores", 
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
    return { statusCode: 200, message: "Denúncia da notícia inserida com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir denúncia da notícia:", error.message));
    return { statusCode: 500, message: "Erro ao inserir denúncia da notícia!" };
  }
}

export async function selectStatusDenunciaNoticia(idNoticia) {
  try {
    const { total: countResultDenunciasAguardandoRevisao } = await db.get(
      `SELECT COUNT(*) as total 
       FROM DENUNCIA_NOTICIA 
       WHERE status = ? AND idNoticia = ?`,
      ["Aguardando revisão dos administradores", idNoticia]
    );

    const { total: countResultDenunciasRevisadas } = await db.get(
      `SELECT COUNT(*) as total 
       FROM DENUNCIA_NOTICIA 
       WHERE status = ? AND idNoticia = ?`,
      ["Revisada por administradores", idNoticia]
    );

    if (countResultDenunciasAguardandoRevisao === 0 && countResultDenunciasRevisadas === 0) {
      return {
        statusCode: 200,
        message: "Esta notícia não possui denúncias",
        statusNoticia: ""
      };
    } else if (countResultDenunciasRevisadas > countResultDenunciasAguardandoRevisao) {
      return {
        statusCode: 200,
        message: "Esta notícia foi revisada e aprovada",
        statusNoticia: "Revisada por administradores"
      };
    } else {
      return {
        statusCode: 200,
        message: "Esta notícia possui análises de denúncias pendentes",
        statusNoticia: "Aguardando revisão dos administradores"
      };
    }
  } catch (error) {
    console.error("Erro ao capturar notícias:", error.message);
    return { statusCode: 500, message: "Erro ao verificar status da notícia!" };
  }
}