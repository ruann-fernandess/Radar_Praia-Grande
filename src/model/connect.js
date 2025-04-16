import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, "../config/bancoRadarPG.db");

export async function openDb() {
    try {
        const db = await open({
            filename: dbPath, // Agora usa um caminho absoluto
            driver: sqlite3.Database
        });

        console.log("✅ Conectado ao banco de dados com sucesso!");
        return db;
    } catch (error) {
        console.error("❌ Erro ao conectar ao banco de dados:", error.message);
        process.exit(1);
    }
}
