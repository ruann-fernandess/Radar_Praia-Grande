import { openDb } from "./connect.js";
const db = await openDb();
import chalk from 'chalk';

export async function createTableBairro() {
  try {
    
    await db.exec(
      `CREATE TABLE IF NOT EXISTS BAIRRO (
                  siglaBairro VARCHAR(3) PRIMARY KEY,
                  nomeBairro VARCHAR(50) NOT NULL
              );`
    );

    const bairros = [
      ['MIL', 'Militar'],
      ['CAF', 'Canto do Forte'],
      ['BOQ', 'Boqueirão'],
      ['GUI', 'Guilhermina'],
      ['AVI', 'Aviação'],
      ['TUP', 'Tupi'],
      ['OCI', 'Ocian'],
      ['MIR', 'Mirim'],
      ['MAR', 'Maracanã'],
      ['CAI', 'Caiçara'],
      ['REA', 'Real'],
      ['FLO', 'Flórida'],
      ['SOL', 'Solemar'],
      ['CCR', 'Cidade da Criança'],
      ['PRI', 'Princesa'],
      ['IMP', 'Imperador'],
      ['MEL', 'Melvi'],
      ['SAM', 'Samambaia'],
      ['ESM', 'Esmeralda'],
      ['RIB', 'Ribeirópolis'],
      ['AND', 'Andaraguá'],
      ['NVM', 'Nova Mirim'],
      ['ANH', 'Anhanguera'],
      ['QUI', 'Quietude'],
      ['STM', 'Santa Marina'],
      ['TPR', 'Tupiry'],
      ['ANT', 'Antártica'],
      ['VLS', 'Vila Sônia'],
      ['GLO', 'Glória'],
      ['STC', 'Sítio do Campo'],
      ['XXV', 'Xixová'],
      ['SRM', 'Serra do Mar']
    ];

    await db.exec('BEGIN TRANSACTION');

    for (const bairro of bairros) {
      const [siglaBairro, nomeBairro] = bairro;

      const result = await db.get(
        `SELECT 1 FROM BAIRRO WHERE siglaBairro = ?`,
        [siglaBairro]
      );

      if (!result) {
        await db.run(
          `INSERT INTO BAIRRO (siglaBairro, nomeBairro) VALUES (?, ?)`,
          [siglaBairro, nomeBairro]
        );        
      }
    }


    await db.exec('COMMIT');

    console.log(chalk.green("Tabela BAIRRO criada e preenchida com sucesso!"));
  } catch (error) {

    await db.exec('ROLLBACK');
    console.error(chalk.red("Erro ao criar ou preencher a tabela BAIRRO:", error.message));
  }
}
