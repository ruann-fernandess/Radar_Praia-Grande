import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  try {
    const db = await open({
      filename: './bancoRadarPG.db',
      driver: sqlite3.Database
    });

    console.log('✅ Conectado ao banco de dados com sucesso!');
    return db;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    process.exit(1); // Finaliza a aplicação em caso de erro crítico
  }
}
