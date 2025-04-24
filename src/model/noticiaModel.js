import { openDb } from "./connect.js";
const db = await openDb();

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
  
      console.log("✅ Tabela NOTICIA criada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao criar a tabela NOTICIA:", error.message);
    }
  }