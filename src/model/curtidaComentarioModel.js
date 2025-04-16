import { openDb } from "./connect.js";
const db = await openDb();

export async function createTableCurtidaComentario() {
    try {
      await db.exec(
        `CREATE TABLE IF NOT EXISTS CURTIDA_COMENTARIO (
          idCurtidaComentario INTEGER PRIMARY KEY AUTOINCREMENT,
          idComentario INTEGER NOT NULL,
          apelido VARCHAR(15) NOT NULL,
          FOREIGN KEY(idComentario) REFERENCES COMENTARIO(idComentario),
          FOREIGN KEY(apelido) REFERENCES USUARIO(apelido)
        );`
      );
  
      console.log("✅ Tabela CURTIDA_COMENTARIO criada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao criar a tabela CURTIDA_COMENTARIO:", error.message);
    }
  }
  