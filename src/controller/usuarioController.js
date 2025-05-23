import {verificaEmail, verificaApelidoUsuario, insertUsuario, verificaLogin, updateUsuario, deleteUsuario } from "../model/usuarioModel.js";

export async function cadastro(req, res) {
    try {
        const { email, apelido } = req.body;
        const emailExiste = await verificaEmail(email);
        const usuarioExiste = await verificaApelidoUsuario(apelido);

        if (emailExiste > 0 || usuarioExiste > 0) {
            if (emailExiste > 0 && usuarioExiste > 0) {
                return res.status(400).json({ 
                    statusCode: 400, 
                    message: "O e-mail e o usuário já estão cadastrados." 
                });
            } else if (emailExiste > 0) {
                return res.status(400).json({ 
                    statusCode: 400, 
                    message: "O e-mail já está cadastrado." 
                });
            } else if (usuarioExiste > 0) {
                return res.status(400).json({ 
                    statusCode: 400, 
                    message: "O usuário já está cadastrado." 
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
            message: "Erro ao cadastrar usuário: " + error.message 
        });
    }
}


export async function login(req, res){
    try{
        const {email, senha} = req.body;
        const usuarioExiste = await verificaLogin(email, senha)

        if (usuarioExiste){
            console.log(req.session)
            req.session.user = { 
                apelido: usuarioExiste.apelido,  
                email: usuarioExiste.email,
                nome: usuarioExiste.nome,
                fotoCapa: usuarioExiste.fotoCapa,
                fotoPerfil: usuarioExiste.fotoPerfil,
                biografia: usuarioExiste.biografia
            };

            return res.status(200).json({ 
                statusCode: 200, 
                message: "✅ Login bem-sucedido!",
                redirect: "/perfil.html"
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
            message: "Erro ao logar usuário: " + error.message 
        });
    }
}

export function verificaAutenticacao(req, res, next) {
    console.log("🔍 Sessão do usuário:", req.session.user); 
    if (req.session.user) {
        return next();
    } else {
        res.status(401).json({ 
            statusCode: 401, 
            message: "⚠️Usuário não autenticado!" 
        });
    }
}

export async function perfil(req, res) {
    try {
        const usuario = req.session.user;

        return res.status(200).json({
            statusCode: 200,
            message: "✅ Perfil carregado com sucesso!",
            apelido: usuario.apelido,
            email: usuario.email,
            nome: usuario.nome,
            fotoCapa: usuario.fotoCapa,
            fotoPerfil: usuario.fotoPerfil,
            biografia: usuario.biografia
        });

    } catch (error) {
        return res.status(500).json({ 
            statusCode: 500, 
            message: "❌ Erro ao carregar perfil: " + error.message 
        });
    }
}

export async function alterarPerfil(req, res) {
    try {
      const usuario = req.session.user;
  
      
      const { nome, email, fotoPerfil, fotoCapa, biografia } = req.body;
  
      
      if (email && email !== usuario.email) {
        const count = await verificaEmail(email);
        if (count > 0) {
          return res.status(400).json({
            statusCode: 400,
            message: "❌ E-mail já em uso."
          });
        }
      }
  
      
      const usuarioAtualizado = {
        nome: nome || usuario.nome,
        fotoPerfil: fotoPerfil || usuario.fotoPerfil || "/imagens/iconeUsuarioPadrao.jpg",
        email: email || usuario.email,
        fotoCapa: fotoCapa || usuario.fotoCapa || "/imagens/bannerUsuarioPadrao.jpg",
        biografia: biografia || usuario.biografia || "Estou usando o RADAR PG!",
        apelido: usuario.apelido
      };
  
      
      const resultadoUpdate = await updateUsuario(usuarioAtualizado);
  
      if (resultadoUpdate.statusCode === 200) {
        
        req.session.user = { ...usuario, ...usuarioAtualizado };
  
        return res.status(200).json({
          statusCode: 200,
          message: "✅ Perfil atualizado com sucesso.",
          usuario: { ...usuario, ...usuarioAtualizado }
        });
      } else {
        return res.status(resultadoUpdate.statusCode).json(resultadoUpdate);
      }
  
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: "❌ Erro ao alterar perfil: " + error.message
      });
    }
  }
  
  export async function apagarPerfil(req, res) {
    try {
      const usuario = req.session.user;
  
      await deleteUsuario(usuario.apelido);
  
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            statusCode: 500,
            message: "❌ Perfil apagado, mas houve erro ao encerrar a sessão.",
          });
        }
  
        return res.status(200).json({
          statusCode: 200,
          message: "✅ Perfil apagado com sucesso.",
          redirect: "/login.html"
        });
      });
    } catch (error) {
      console.error("Erro ao apagar perfil:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "❌ Erro ao apagar perfil.",
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
                    message: '❌ Erro ao encerrar a sessão.' 
                });
            }

            res.clearCookie('connect.sid'); // nome padrão do cookie
            return res.status(200).json({ 
                statusCode: 200,
                message: '✅ Logout realizado com sucesso.',
                redirect: '/login.html'
            });
        });
    } catch (error) {
        return res.status(500).json({ 
            statusCode: 500,
            message: '❌ Erro interno no logout: ' + error.message 
        });
    }
}
