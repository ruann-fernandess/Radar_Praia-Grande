import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, "../config/bancoRadarPG.db");

export async function openDb(log = false) {
    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
        if (log) {
            console.log(chalk.green("Conectado ao banco de dados com sucesso!"));
        }
        return db;
    } catch (error) {
        console.error(chalk.red("Erro ao conectar ao banco de dados:", error.message));
        process.exit(1);
    }
}
