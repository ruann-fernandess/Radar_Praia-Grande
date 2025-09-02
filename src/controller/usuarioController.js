import { deleteImagensUsuario } from "../model/imagemModel.js";
import { deleteNoticiasUsuario, selectIdsNoticiasPorApelido } from "../model/noticiaModel.js";
import { verificaEmail, verificaApelidoUsuario, insertUsuario, verificaLogin, updateUsuario, buscarUsuarioPorApelido, deleteUsuario } from "../model/usuarioModel.js";
import { verificaAmizade, insertAmizade, deleteAmizade, contaSeguidores, contaSeguindo, deleteTodasAmizadesPorApelido } from "../model/amizadeModel.js";
import { deleteTodasCurtidasNoticia, deleteTodasCurtidasNoticiaPorApelido } from "../model/curtidaNoticiaModel.js";

export async function cadastro(req, res) {
    try {
        const { email, apelido } = req.body;
        const emailExiste = await verificaEmail(email);
        const usuarioExiste = await verificaApelidoUsuario(apelido);
 
        if (emailExiste > 0 || usuarioExiste > 0) {
            if (emailExiste > 0 && usuarioExiste > 0) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "O e-mail e o usuário já estão em uso."
                });
            } else if (emailExiste > 0) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "O e-mail já está em uso."
                });
            } else if (usuarioExiste > 0) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "O usuário já está em uso."
                });
            }
        }
 
        const resultado = await insertUsuario(req.body);
 
        res.status(resultado.statusCode).json({
            statusCode: resultado.statusCode,
            message: resultado.message,
            redirect: "/login.html"  
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Erro ao cadastrar usuário!"
        });
    }
}
 
export async function login(req, res){
    try{
        const {email, senha} = req.body;
        const usuarioExiste = await verificaLogin(email, senha);
 
        if (usuarioExiste) {
            req.session.user = {
                apelido: usuarioExiste.apelido,  
                email: usuarioExiste.email,
                nome: usuarioExiste.nome,
                fotoCapa: usuarioExiste.fotoCapa,
                fotoPerfil: usuarioExiste.fotoPerfil,
                biografia: usuarioExiste.biografia,
                dataCriacao: usuarioExiste.dataCriacao
            };
 
            return res.status(200).json({
                statusCode: 200,
                message: "Login bem-sucedido!",
                redirect: "/home.html"
            });
        }else{
            return res.status(400).json({
                statusCode: 400,
                message: "Email ou senha não coincidem."
            });
        }
    } catch(error){
        res.status(500).json({
            statusCode: 500,
            message: "Erro ao logar usuário!"
        });
    }
}
 
export function verificaAutenticacao(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.status(401).json({
            statusCode: 401,
            message: "Usuário não autenticado!"
        });
    }
}
 
//função não está sendo chamada
export function impedeUsuariosAutenticados(req, res, next) {
  if (req.session.user) {
        return res.redirect("/perfil.html");
    } else {
        next();
    }
}
 
export async function perfil(req, res) {
    try {
        const usuario = req.session.user;
 
        return res.status(200).json({
            statusCode: 200,
            apelido: usuario.apelido,
            email: usuario.email,
            nome: usuario.nome,
            fotoCapa: usuario.fotoCapa,
            fotoPerfil: usuario.fotoPerfil,
            biografia: usuario.biografia,
            dataCriacao: usuario.dataCriacao
        });
 
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Erro ao carregar perfil!"
        });
    }
}

export async function perfilOutroUsuario(req, res) {
  try {
    const apelidoOutroUsuario = req.params.apelidoOutroUsuario;

    // Busca no banco
    const outroUsuario = await buscarUsuarioPorApelido(apelidoOutroUsuario);

    if (!outroUsuario) {
      return res.status(404).json({
        statusCode: 404,
        message: "Usuário não encontrado!"
      });
    }

    return res.status(200).json({
      statusCode: 200,
      apelido: outroUsuario.apelido,
      nome: outroUsuario.nome,
      fotoCapa: outroUsuario.fotoCapa,
      fotoPerfil: outroUsuario.fotoPerfil,
      biografia: outroUsuario.biografia,
      dataCriacao: outroUsuario.dataCriacao
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao carregar perfil!"
    });
  }
}
 
export async function alterarPerfil(req, res) {
  try {
    const usuario = req.session.user;
    const { nome, email, biografia } = req.body;
 
    if (email && email !== usuario.email) {
      const count = await verificaEmail(email);
      if (count > 0) {
        return res.status(400).json({
          statusCode: 400,
          message: "E-mail já em uso!"
        });
      }
    }
 
    const usuarioAtualizado = {
      nome: nome || usuario.nome,
      email: email || usuario.email,
      biografia: biografia || usuario.biografia || "Estou usando o RADAR PG!",
      apelido: usuario.apelido
    };
 
    const resultadoUpdate = await updateUsuario(usuarioAtualizado);
 
    if (resultadoUpdate.statusCode === 200) {
      const usuarioComImagens = await buscarUsuarioPorApelido(usuario.apelido);
 
      // Converte BLOB para base64 data URL
      if (usuarioComImagens.fotoPerfil) {
        usuarioComImagens.fotoPerfil = `${usuarioComImagens.fotoPerfil.toString('base64')}`;
      } else {
        usuarioComImagens.fotoPerfil = null;
      }
 
      if (usuarioComImagens.fotoCapa) {
        usuarioComImagens.fotoCapa = `${usuarioComImagens.fotoCapa.toString('base64')}`;
      } else {
        usuarioComImagens.fotoCapa = null;
      }
 
      req.session.user = usuarioComImagens;
 
      return res.status(200).json({
        statusCode: 200,
        message: "Perfil atualizado com sucesso!",
        usuario: usuarioComImagens
      });
    } else {
      return res.status(resultadoUpdate.statusCode).json(resultadoUpdate);
    }
 
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao alterar perfil!",
    });
  }
}
 
  export async function apagarPerfil(req, res) {
    try {
      const usuario = req.session.user;
 
      const arrayIdsNoticias = await selectIdsNoticiasPorApelido(usuario.apelido);
      for (let i = 0; i < arrayIdsNoticias.length; i++) {
        await deleteTodasCurtidasNoticia(arrayIdsNoticias[i]);
      }
      await deleteTodasAmizadesPorApelido(usuario.apelido);
      await deleteTodasCurtidasNoticiaPorApelido(usuario.apelido);
      await deleteNoticiasUsuario(usuario.apelido);
      await deleteImagensUsuario(usuario.apelido);
      await deleteUsuario(usuario.apelido);
 
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            statusCode: 500,
            message: "Perfil apagado, mas houve erro ao encerrar a sessão!",
          });
        }
 
        return res.status(200).json({
          statusCode: 200,
          message: "Perfil apagado com sucesso!",
          redirect: "/login.html"
        });
      });
    } catch (error) {
      console.error("Erro ao apagar perfil:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Erro ao apagar perfil!",
      });
    }
  }
 
  export async function logout(req, res) {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('Erro ao fazer logout:', err);
                return res.status(500).json({
                    statusCode: 500,
                    message: 'Erro ao encerrar a sessão!'
                });
            }
 
            res.clearCookie('connect.sid'); // nome padrão do cookie
            return res.status(200).json({
                statusCode: 200,
                message: 'Logout realizado com sucesso!',
                redirect: '/login.html'
            });
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: 'Erro interno no logout!'
        });
    }
}

export async function verificaExistenciaAmizade(req, res) {
  try {
    const { apelido1, apelido2 } = req.params;

    if (!apelido1 || !apelido2) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido1 e apelido2 são obrigatórios."
      });
    }

    const usuario1Existe = await verificaApelidoUsuario(apelido1);
    const usuario2Existe = await verificaApelidoUsuario(apelido2);

    if (usuario1Existe > 0 && usuario2Existe > 0) {
      const existeAmizade = await verificaAmizade(apelido1, apelido2);
      return res.status(200).json({ existeAmizade });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Os usuários fornecidos não são válidos!"
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao verificar amizade!"
    });
  }
}

export async function seguirUsuario(req, res) {
  try {
    const { apelido1, apelido2 } = req.params;

    if (!apelido1 || !apelido2) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido1 e apelido2 são obrigatórios."
      });
    }

    const usuario1Existe = await verificaApelidoUsuario(apelido1);
    const usuario2Existe = await verificaApelidoUsuario(apelido2);

    if (usuario1Existe > 0 && usuario2Existe > 0) {
      const existeAmizade = await verificaAmizade(apelido1, apelido2);
      
      if (existeAmizade == 0) {
        const seguiuUsuario = await insertAmizade(apelido1, apelido2);
        return res.status(seguiuUsuario.statusCode).json(seguiuUsuario);
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: "Você já segue este usuário!"
        });
      }
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Os usuários fornecidos não são válidos!"
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao seguir usuário!"
    });
  }
}

export async function deixarDeSeguirUsuario(req, res) {
  try {
    const { apelido1, apelido2 } = req.params;

    if (!apelido1 || !apelido2) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido1 e apelido2 são obrigatórios."
      });
    }

    const usuario1Existe = await verificaApelidoUsuario(apelido1);
    const usuario2Existe = await verificaApelidoUsuario(apelido2);

    if (usuario1Existe > 0 && usuario2Existe > 0) {
      const existeAmizade = await verificaAmizade(apelido1, apelido2);
      
      if (existeAmizade == 1) {
        await deleteAmizade(apelido1, apelido2);
        
        return res.status(200).json({
          statusCode: 200,
          message: "Você deixou de seguir este usuário!"
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: "Não foi possível deixar de seguir este usuário!"
        });
      }
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Os usuários fornecidos não são válidos!"
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao deixar de seguir usuário!"
    });
  }
}

export async function contarSeguidores(req, res) {
  try {
    const { apelido } = req.params;

    if (!apelido) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido é obrigatório.",
        quantidadeSeguidores: 0
      });
    }

    const usuarioExiste = await verificaApelidoUsuario(apelido);

    if (usuarioExiste > 0) {
      const quantidadeSeguidores = await contaSeguidores(apelido);
      return res.status(quantidadeSeguidores.statusCode).json(quantidadeSeguidores);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O usuário fornecido não é válido!",
        quantidadeSeguidores: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de seguidores!",
      quantidadeSeguidores: 0
    });
  }
}

export async function contarSeguindo(req, res) {
  try {
    const { apelido } = req.params;

    if (!apelido) {
      return res.status(400).json({
        statusCode: 400,
        message: "Parâmetros apelido é obrigatório.",
        quantidadeSeguindo: 0
      });
    }

    const usuarioExiste = await verificaApelidoUsuario(apelido);

    if (usuarioExiste > 0) {
      const quantidadeSeguindo = await contaSeguindo(apelido);
      return res.status(quantidadeSeguindo.statusCode).json(quantidadeSeguindo);
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "O usuário fornecido não é válido!",
        quantidadeSeguindo: 0
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Erro ao contar a quantidade de seguindo!",
      quantidadeSeguindo: 0
    });
  }
}