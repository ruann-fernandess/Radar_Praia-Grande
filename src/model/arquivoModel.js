import { openDb } from "./connect.js";
const db = await openDb();

export async function createTableArquivo() {
  try {

    await db.exec(
      `CREATE TABLE IF NOT EXISTS ARQUIVO ( 
        idArquivo INTEGER PRIMARY KEY AUTOINCREMENT,
        caminho VARCHAR(200) NOT NULL,
        idNoticia INTEGER NOT NULL,
        FOREIGN KEY(idNoticia) REFERENCES NOTICIA(idNoticia)
      );`
    );

    console.log("✅ Tabela ARQUIVO criada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar a tabela ARQUIVO:", error.message);
  }
}
