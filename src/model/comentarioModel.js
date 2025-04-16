import { openDb } from "./connect.js";
const db = await openDb();

export async function createTableComentario() {
    try {
      await db.exec(
        `CREATE TABLE IF NOT EXISTS COMENTARIO (
          idComentario INTEGER PRIMARY KEY AUTOINCREMENT,
          comentario VARCHAR(200) NOT NULL,
          dataComentario DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          idNoticia INTEGER NOT NULL,
          apelido VARCHAR(15) NOT NULL,
          FOREIGN KEY(idNoticia) REFERENCES NOTICIA(idNoticia),
          FOREIGN KEY(apelido) REFERENCES USUARIO(apelido)
        );`
      );
  
      console.log("✅ Tabela COMENTARIO criada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao criar a tabela COMENTARIO:", error.message);
    }
  }
  