import { openDb } from "./connect.js";
import chalk from 'chalk';
import bcrypt from "bcryptjs";
import { verificaAmizade } from "../model/amizadeModel.js";

const db = await openDb();

export async function createTableUsuario() {
  try {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS USUARIO (
                apelido VARCHAR(30) PRIMARY KEY COLLATE NOCASE,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE COLLATE NOCASE,
                senha VARCHAR(100) NOT NULL,
                biografia VARCHAR(200) DEFAULT "Estou usando o RADAR PG!",
                desativado INTEGER NOT NULL DEFAULT 0, 
                dataCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                admin INTEGER NOT NULL DEFAULT 0
            );`
    );

    await db.exec('BEGIN TRANSACTION');

    // Lista de admins iniciais
    const adminsIniciais = [
      { apelido: "isaque@admin", nome: "Admin@Isaque", email: "isaque_admin@admin.com", senha: "admin@isaque" },
      { apelido: "luiza@admin", nome: "Admin@Luiza", email: "luiza_admin@admin.com", senha: "admin@luiza" },
      { apelido: "ruan@admin", nome: "Admin@Ruan", email: "ruan_admin@admin.com", senha: "admin@ruan" },
      { apelido: "paddin@admin", nome: "Admin@Paddin", email: "paddin_admin@admin.com", senha: "admin@paddin" },
      { apelido: "salgado@admin", nome: "Admin@Salgado", email: "salgado_admin@admin.com", senha: "admin@salgado" }
    ];

    for (const admin of adminsIniciais) {
      const result = await db.get(
        `SELECT 1 FROM USUARIO WHERE apelido = ? AND nome = ? AND email = ? AND admin = 1`,
        [admin.apelido, admin.nome, admin.email]
      );

      if (!result) {
        const hash = bcrypt.hashSync(token.senha, 10);

        await db.run(
          `INSERT INTO USUARIO (apelido, nome, email, senha, admin) VALUES (?, ?, ?, ?, ?)`,
          [admin.apelido, admin.nome, admin.email, hash, 1]
        );
      }
    }

    await db.exec('COMMIT');

    console.log(chalk.green("Tabela USUARIO criada com sucesso e admins iniciais inseridos!"));
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error(chalk.red("Erro ao criar a tabela USUARIO:", error.message));
  }
}

export async function verificaApelidoUsuario(apelido) {
  try {
    const result = await db.get(
      `SELECT admin FROM usuario WHERE apelido = ?`,
      [apelido]
    );

    if (result) {
      // Apelido existe, retorna se é ou não admin (0 ou 1)
      return { existe: 1, admin: result.admin };
    } else {
      return { existe: 0, admin: 0 };
    }
  } catch (error) {
    console.error("Erro ao verificar apelido:", error.message);
    return { existe: -1, admin: 0 };
  }
}

export async function verificaEmail(email) {
  try {
    const result = await db.get(
      `SELECT COUNT(*) AS count FROM usuario WHERE email = ? AND admin = ?`,
      [email, 0]
    );

    return result.count; 
  } catch (error) {
    return -1; 
  }
}

export async function verificaLogin(email, senha) {
    try {
        // Não é possível verificar a validade da senha durante o SELECT na tabela
        // Por isso é necessário capturar o e-mail, verificar o hash da senha e somente se ambos forem válidos: puxar os dados do usuário
        const validacao = await db.get(
            `SELECT
                U.email, 
                U.senha
            FROM USUARIO U 
            WHERE U.email = ? 
                AND U.admin = ? 
                AND U.desativado = 0`,
            [email, 0]
        );

        if (!validacao) {
        return null;
        }

        // Comparando o hash gerado na tentativa de login com o hash presente no banco de dados
        const loginValido = bcrypt.compareSync(senha, validacao.senha);
        
        if (loginValido) {
            const usuario = await db.get(
                `SELECT 
                U.apelido, 
                U.email, 
                U.nome, 
                U.biografia, 
                datetime(U.dataCriacao, 'localtime') AS dataCriacao, 
                IP.imagem AS fotoPerfil,
                IB.imagem AS fotoCapa, 
                U.admin 
                FROM USUARIO U
                LEFT JOIN IMAGEM IP ON U.apelido = IP.apelido AND IP.identificador = "Ícone"
                LEFT JOIN IMAGEM IB ON U.apelido = IB.apelido AND IB.identificador = "Banner"
                WHERE U.email = ? 
                AND U.admin = ?`,
                [email, 0]
            );

            if (!usuario) {
                return null;
            }

            // Função para converter BLOB (Buffer) em data URI base64
            function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
                if (!blobBuffer) {
                    return null;
                }

                const base64 = blobBuffer.toString("base64");
                return `data:${mimeType};base64,${base64}`;
            }

            // Cria novo objeto com as imagens convertidas
            return {
                apelido: usuario.apelido,
                email: usuario.email,
                nome: usuario.nome,
                biografia: usuario.biografia,
                dataCriacao: usuario.dataCriacao,
                fotoPerfil: blobToDataURI(usuario.fotoPerfil),
                fotoCapa: blobToDataURI(usuario.fotoCapa),
                admin: usuario.admin
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error(chalk.red("Email e senha não coincidem", error.message));
        return null;
    }
}

export async function insertUsuario(usuario) {
  try {
    await db.run(
      `INSERT INTO usuario 
                (apelido, nome, email, senha) 
                VALUES (?, ?, ?, ?)`,
      [
        usuario.apelido,
        usuario.nome,
        usuario.email,
        usuario.senha,
      ]
    );

    console.log(chalk.green("Usuário inserido com sucesso!"));
    return {
      statusCode: 200, message: "Usuário inserido com sucesso!"
    };
  } catch (error) {
    console.error(chalk.red("Erro ao inserir usuário:", error.message));
    return {
      statusCode: 500, message: "Erro ao inserir usuário!"
    };
  }
}

export async function updateUsuario(usuario) {
  try {
    await db.run(
      `UPDATE usuario 
                SET nome = ?, 
                    email = ?, 
                    biografia = ?
                WHERE apelido = ?`,
      [
        usuario.nome,
        usuario.email,
        usuario.biografia || "Estou usando o RADAR PG!",
        usuario.apelido, // qual usuário será atualizado
      ]
    );

    console.log(chalk.green("Usuário atualizado com sucesso!"));
    return { statusCode: 200, message: "Usuário atualizado com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao atualizar usuário:", error.message));
    return { statusCode: 500, message: "Erro ao atualizar usuário!" };
  }
}

export async function buscarUsuarioPorApelido(apelido) {
  try {
    const usuario = await db.get(
      `SELECT 
        U.apelido, 
        U.email, 
        U.nome, 
        U.biografia, 
        IP.imagem AS fotoPerfil,
        IB.imagem AS fotoCapa
      FROM USUARIO U
      LEFT JOIN IMAGEM IP ON U.apelido = IP.apelido AND IP.identificador = "Ícone"
      LEFT JOIN IMAGEM IB ON U.apelido = IB.apelido AND IB.identificador = "Banner"
      WHERE U.apelido = ? 
        AND U.admin = ? 
        AND U.desativado = 0`,
      [apelido, 0]
    );

    if (!usuario) {
      return null;
    }

    // Função para converter BLOB (Buffer) em data URI base64
    function blobToDataURI(blobBuffer, mimeType = 'image/jpeg') {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString('base64');
      return `data:${mimeType};base64,${base64}`;
    }

    // Cria novo objeto com as imagens convertidas
    return {
      apelido: usuario.apelido,
      email: usuario.email,
      nome: usuario.nome,
      biografia: usuario.biografia,
      dataCriacao: usuario.dataCriacao,
      fotoPerfil: blobToDataURI(usuario.fotoPerfil),
      fotoCapa: blobToDataURI(usuario.fotoCapa),
    };
  } catch (error) {
    console.error("Erro ao buscar usuário por apelido:", error.message);
    return null;
  }
}

export async function deleteUsuario(apelido) {
  try {
    await db.run(`DELETE FROM USUARIO WHERE apelido = ?`, [apelido]);
    console.log(chalk.green(`Usuário '${apelido}' apagado com sucesso!`));
  } catch (error) {
    console.error(chalk.red("Erro ao apagar o usuário:", error.message));
  }
}

export async function selectUsuariosPesquisados(apelido, busca, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
        U.apelido, 
        IP.imagem AS fotoPerfil, 
        U.dataCriacao 
      FROM USUARIO U
      LEFT JOIN IMAGEM IP 
        ON U.apelido = IP.apelido 
        AND IP.identificador = "Ícone"
      WHERE 
        U.apelido LIKE ? 
        AND U.apelido != ?          -- evita exibir o próprio apelido
        AND U.admin = 0             -- retorna apenas usuários comuns
        AND U.desativado = 0 
      ORDER BY 
        U.dataCriacao DESC 
      LIMIT ? OFFSET ?`,
      [`${busca}%`, apelido, limite, offset]
    );

    const countResult = await db.get(
      `SELECT COUNT(*) as total
       FROM USUARIO 
       WHERE apelido LIKE ?
         AND NOT apelido = ? 
         AND admin = ? 
         AND desativado = 0`,
      [`${busca}%`, apelido, 0]
    );

    // Função para converter BLOB (Buffer) em data URI base64
    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    // Aguarda todos os mapeamentos
    const usuarios = await Promise.all(
      rows.map(async usuario => ({
        apelido: usuario.apelido,
        fotoPerfil: blobToDataURI(usuario.fotoPerfil),
        usuario1SegueUsuario2: await verificaAmizade(apelido, usuario.apelido),
        usuario2SegueUsuario1: await verificaAmizade(usuario.apelido, apelido),
        dataCriacao: usuario.dataCriacao
      }))
    );

    return {
      usuarios,
      totalUsuarios: countResult.total
    };

  } catch (error) {
    console.error("Erro ao pesquisar usuários:", error.message);
    return { usuarios: [], totalUsuarios: 0 };
  }
}

export async function selectUsuariosPesquisadosAdmin(apelido, busca, pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    const rows = await db.all(
      `SELECT 
        U.apelido, 
        U.desativado, 
        IP.imagem AS fotoPerfil, 
        U.dataCriacao 
      FROM USUARIO U
      LEFT JOIN IMAGEM IP 
        ON U.apelido = IP.apelido 
        AND IP.identificador = "Ícone"
      WHERE 
        U.apelido LIKE ? 
        AND U.apelido != ?          -- evita exibir o próprio apelido
        AND U.admin = 0             -- retorna apenas usuários comuns
      ORDER BY 
        U.dataCriacao DESC 
      LIMIT ? OFFSET ?`,
      [`${busca}%`, apelido, limite, offset]
    );

    const countResult = await db.get(
      `SELECT COUNT(*) as total
       FROM USUARIO 
       WHERE apelido LIKE ?
         AND NOT apelido = ? 
         AND admin = ?`,
      [`${busca}%`, apelido, 0]
    );

    // Função para converter BLOB (Buffer) em data URI base64
    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    // Aguarda todos os mapeamentos
    const usuarios = await Promise.all(
      rows.map(async usuario => ({
        apelido: usuario.apelido,
        desativado: usuario.desativado,
        fotoPerfil: blobToDataURI(usuario.fotoPerfil),
        usuario1SegueUsuario2: await verificaAmizade(apelido, usuario.apelido),
        usuario2SegueUsuario1: await verificaAmizade(usuario.apelido, apelido),
        dataCriacao: usuario.dataCriacao
      }))
    );

    return {
      usuarios,
      totalUsuarios: countResult.total
    };

  } catch (error) {
    console.error("Erro ao pesquisar usuários:", error.message);
    return { usuarios: [], totalUsuarios: 0 };
  }
}

export async function verificaLoginAdmin(apelido, nome, senha) {
  try {
    const validacao = await db.get(
      `SELECT
        U.email, 
        U.senha
      FROM USUARIO U 
      WHERE U.apelido = ? 
        AND U.nome = ? 
        AND U.admin = ?`,
      [apelido, nome, 1]
    );

    if (!validacao) {
      return null;
    }

    const loginValido = bcrypt.compareSync(senha, validacao.senha);
    
    if (loginValido) {
      const usuario = await db.get(
        // IP = Imagem perfil
        // IB = Imagem fotoCapa
        `SELECT 
          U.apelido, 
          U.email, 
          U.nome, 
          U.biografia, 
          datetime(U.dataCriacao, 'localtime') AS dataCriacao, 
          U.admin 
        FROM USUARIO U
        WHERE U.apelido = ? 
          AND U.nome = ? 
          AND U.admin = ?`,
        [apelido, nome, 1]
      );

      if (!usuario) {
        return null;
      }

      // Cria novo objeto com as imagens convertidas
      return {
        apelido: usuario.apelido,
        email: usuario.email,
        nome: usuario.nome,
        biografia: usuario.biografia,
        dataCriacao: usuario.dataCriacao,
        fotoPerfil: "-",
        fotoCapa: "-",
        admin: usuario.admin
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(chalk.red("Email e senha não coincidem", error.message));
    return null;
  }
}

export async function selectUsuariosAdmin(pagina, limite) {
  try {
    const offset = (pagina - 1) * limite;

    // Consulta para obter os usuários, ordenados por número de denúncias
    const rows = await db.all(
      `SELECT 
          U.apelido, 
          U.desativado, 
          IP.imagem AS fotoPerfil, 
          U.dataCriacao,
          COUNT(DU.idDenunciaUsuario) AS totalDenuncias
        FROM USUARIO U
        LEFT JOIN IMAGEM IP 
          ON U.apelido = IP.apelido 
          AND IP.identificador = "Ícone"
        LEFT JOIN DENUNCIA_USUARIO DU 
          ON U.apelido = DU.apelidoDenunciado
        WHERE U.admin = ?
        GROUP BY 
          U.apelido, 
          IP.imagem, 
          U.dataCriacao
        ORDER BY 
          totalDenuncias DESC, 
          U.dataCriacao DESC
        LIMIT ? OFFSET ?`,
      [0, limite, offset]
    );

    // Consulta para contar o total de usuários
    const countResult = await db.get(
      `SELECT COUNT(DISTINCT U.apelido) AS total
        FROM USUARIO U
        WHERE U.admin = ?`,
      [0]
    );

    // Função para converter BLOB (Buffer) em data URI base64
    function blobToDataURI(blobBuffer, mimeType = "image/jpeg") {
      if (!blobBuffer) return null;
      const base64 = blobBuffer.toString("base64");
      return `data:${mimeType};base64,${base64}`;
    }

    // Aguarda todos os mapeamentos
    const usuarios = await Promise.all(
      rows.map(async usuario => ({
        apelido: usuario.apelido, 
        desativado: usuario.desativado,
        fotoPerfil: blobToDataURI(usuario.fotoPerfil),
        dataCriacao: usuario.dataCriacao
      }))
    );

    return {
      usuarios,
      totalUsuarios: countResult.total
    };

  } catch (error) {
    console.error("Erro ao capturar usuários:", error.message);
    return { usuarios: [], totalUsuarios: 0 };
  }
}

export async function updateDesativarUsuario(apelido) {
  try {
    await db.run(
      `UPDATE usuario 
                SET desativado = ?
                WHERE apelido = ?`,
      [
        1,
        apelido
      ]
    );

    console.log(chalk.green("Usuário desativado com sucesso!"));
    return { statusCode: 200, message: "Usuário desativado com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao desativar usuário:", error.message));
    return { statusCode: 500, message: "Erro ao desativar usuário!" };
  }
}

export async function updateAtivarUsuario(apelido) {
  try {
    await db.run(
      `UPDATE usuario 
                SET desativado = ?
                WHERE apelido = ?`,
      [
        0,
        apelido
      ]
    );

    console.log(chalk.green("Usuário ativado com sucesso!"));
    return { statusCode: 200, message: "Usuário ativado com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao ativar usuário:", error.message));
    return { statusCode: 500, message: "Erro ao ativar usuário!" };
  }
}

export async function updateSenha(senha, email) {
  try {
    const hash = bcrypt.hashSync(senha, 10);
    await db.run(
      `UPDATE usuario 
       SET senha = ?
       WHERE email = ?`,
      [
        hash,
        email
      ]
    );

    console.log(chalk.green("Senha atualizada com sucesso!"));
    return { statusCode: 200, message: "Senha atualizada com sucesso!" };
  } catch (error) {
    console.error(chalk.red("Erro ao atualizar senha:", error.message));
    return { statusCode: 500, message: "Erro ao atualizar senha!" };
  }
}
