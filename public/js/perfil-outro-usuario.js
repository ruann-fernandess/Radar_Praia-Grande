import { exibirAlertaErro, exibirAlertaErroERedirecionar} from "./alert.js";
import { exibirModal, esconderModal } from "./modal.js";

// apelido = apelido1
// apelidoOutroUsuario = apelido2
let apelido = "";
let apelidoOutroUsuario = "";
let usuario1SegueUsuario2 = 0;
let usuario2SegueUsuario1 = 0;
let paginaComentarios = 0;

const modalComentarios = document.getElementById("comentariosModal");
const modalAdicionarComentario = document.getElementById("adicionarComentarioModal");
const modalEditarComentario = document.getElementById("editarComentarioModal");

const botaoSeguir = document.querySelector(".seguir-btn");
const botaoDenunciar = document.querySelector(".denunciar-btn");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/usuario/perfil");
    const contentType = res.headers.get("content-type");
    const responseText = await res.text();

    if (!res.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || "Erro desconhecido");
      }
      throw new Error("Erro ao carregar perfil. O servidor retornou HTML inesperado.");
    }

    const data = JSON.parse(responseText);
    apelido = data.apelido;
  } catch (err) {
    console.error(err.message);
    await exibirAlertaErroERedirecionar("error", "Erro", err.message, "../login.html");
    return;
  }

  const apelidoSpan = document.getElementById("apelido");
  const fotoPerfilImg = document.getElementById("fotoPerfil");
  const fotoCapaImg = document.getElementById("fotoCapa");
  const biografiaSpan = document.getElementById("biografia");
  const quantidadeSeguidores = document.getElementById("quantidadeSeguindo");
  const quantidadeSeguindo = document.getElementById("quantidadeSeguidores");

  // Capturando o apelido do perfil que esta sendo visitado
  const caminhoURL = window.location.pathname;
  apelidoOutroUsuario = caminhoURL.split("/")[2];

  // Caso o usuário tente inserir o seu próprio apelido
  if (apelido == apelidoOutroUsuario) {
    window.location.href = "../perfil.html";
  }

  // Capturando as informações do perfil que esta sendo visitado
  fetch(`/usuario/perfil-outro-usuario/${apelidoOutroUsuario}`)
    .then(async (res) => {
      const contentType = res.headers.get("content-type");
      const responseText = await res.text();

      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || "Erro desconhecido");
        }
        throw new Error("Erro ao carregar o perfil deste usuário. O servidor retornou HTML inesperado.");
      }

      return JSON.parse(responseText);
    })
    .then(async (data) => {
      apelidoSpan.textContent = apelidoOutroUsuario;
      fotoPerfilImg.src = data.fotoPerfil;
      fotoCapaImg.src = data.fotoCapa;
      biografiaSpan.textContent = data.biografia;
      quantidadeSeguidores.textContent = await contarSeguidores(apelidoOutroUsuario);
      quantidadeSeguindo.textContent = await contarSeguindo(apelidoOutroUsuario);

      usuario1SegueUsuario2 = await verificaAmizade(apelido, apelidoOutroUsuario);
      usuario2SegueUsuario1 = await verificaAmizade(apelidoOutroUsuario, apelido);

      if (usuario1SegueUsuario2 > 0) {
        if (!botaoSeguir.classList.contains("active")) {
          botaoSeguir.classList.add("active");
        }
        
        if (usuario2SegueUsuario1 == 0) {
          botaoSeguir.textContent = "Deixar de seguir";
        } else {
          botaoSeguir.textContent = "Amigos";
        }
      } else {
        if (botaoSeguir.classList.contains("active")) {
          botaoSeguir.classList.remove("active");
        }
        botaoSeguir.textContent = "Seguir";
      }

      capturarNoticiasDoUsuario(1);
    })
    .catch(async (err) => {
      console.error(err.message);

      if (apelido != "" && apelido != null) {
        await exibirAlertaErroERedirecionar("error", "Erro", err.message, "../home.html");
      } else {
        await exibirAlertaErroERedirecionar("error", "Erro", err.message, "../index.html");
      }
    });
  
  botaoSeguir.addEventListener("click", async function() {
    if (usuario1SegueUsuario2 == 0) {
      const resultado = await seguirUsuario(apelido, apelidoOutroUsuario);
      if (resultado.statusCode == 200) {
        usuario1SegueUsuario2 = 1;
        
        if (!botaoSeguir.classList.contains("active")) {
          botaoSeguir.classList.add("active");
        }

        if (usuario2SegueUsuario1 == 0) {
          botaoSeguir.textContent = "Deixar de seguir";
        } else {
          botaoSeguir.textContent = "Amigos";
        }
        
        document.getElementById("quantidadeSeguidores").textContent = parseInt(document.getElementById("quantidadeSeguidores").textContent) + 1;
      } else {
        await exibirAlertaErro("error", "Erro", resultado.message);
      }
    } else {
      const resultado = await deixarDeSeguirUsuario(apelido, apelidoOutroUsuario);
      if (resultado.statusCode == 200) {
        usuario1SegueUsuario2 = 0;
        
        if (botaoSeguir.classList.contains("active")) {
          botaoSeguir.classList.remove("active");
        }
        botaoSeguir.textContent = "Seguir";
        
        document.getElementById("quantidadeSeguidores").textContent = parseInt(document.getElementById("quantidadeSeguidores").textContent) - 1;
      } else {
        await exibirAlertaErro("error", "Erro", resultado.message);
      }
    }
  });
});
 
async function capturarNoticiasDoUsuario(pagina = 1) {
  try {
    const res = await fetch(`/noticia/capturar-noticias-usuario/${encodeURIComponent(apelidoOutroUsuario)}?pagina=${pagina}`);
            if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao buscar notícias!");
            throw new Error(errorData.message || "Erro ao buscar notícias");
        }
 
    const data = await res.json();
 
    const noticiasUsuario = document.getElementById("noticiasUsuario");
    const paginacaoNoticias = document.getElementById("paginacaoNoticias");
 
    paginacaoNoticias.innerHTML = "";
    
    if (data.noticias.length == 0) {
      noticiasUsuario.innerHTML = "Nenhuma notícia foi encontrada.";
    } else {
      for (const noticia of data.noticias) {
        const noticiaDiv = document.createElement("div");
        noticiaDiv.classList.add("noticia");
  
        // Legenda (descrição)
        noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: noticia.legenda }));
  
        // Imagens responsivas
        if (noticia.imagens && noticia.imagens.length > 0) {
          const imagensContainer = document.createElement("div");
          imagensContainer.classList.add("imagens-container");
  
          for (const imgObj of noticia.imagens) {
            const imgEl = document.createElement("img");
            imgEl.src = imgObj.imagem;
            imgEl.alt = `Imagem ${imgObj.idImagem}`;
            // Remove estilos inline e deixe responsividade no CSS
            imagensContainer.appendChild(imgEl);
          }
  
          noticiaDiv.appendChild(imagensContainer);
        }
  
        // Metadados
        const metadados = document.createElement("div");
        metadados.classList.add("metadados");
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Bairro: ${noticia.nomeBairro}` }));
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Autor: ${noticia.apelido}` }));
  
        const dataFormatada = formatarDataNoticia(noticia.dataNoticia);
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Data de criação: ${dataFormatada}` }));
  
        // Curtidas
        const botaoCurtir = document.createElement("button");
        botaoCurtir.classList.add("curtir-btn");
        
        let usuarioCurtiuEstaNoticia = await verificarCurtidaNoticia(noticia.idNoticia, apelido);

        if (usuarioCurtiuEstaNoticia > 0) {
          botaoCurtir.classList.add("active");
          botaoCurtir.textContent = "Remover curtida";
        } else {
          botaoCurtir.textContent = "Curtir";
        }

        const curtidas = document.createElement("span");
        const quantidadeCurtidas = document.createElement("b");
        quantidadeCurtidas.textContent = await contarCurtidasNoticia(noticia.idNoticia);

        curtidas.appendChild(quantidadeCurtidas);
        curtidas.appendChild(document.createTextNode(" curtidas"));
        curtidas.appendChild(document.createElement("br"));

        botaoCurtir.addEventListener("click", function() {
          curtirOuDescurtirNoticia(noticia.idNoticia, quantidadeCurtidas, botaoCurtir);
        });

        metadados.appendChild(botaoCurtir);
        metadados.appendChild(curtidas);

        // Comentários
        const botaoComentarios = document.createElement("button");
        botaoComentarios.classList.add("comentarios-btn");
        botaoComentarios.textContent = "Exibir comentários";

        const comentarios = document.createElement("span");

        const quantidadeComentarios = document.createElement("b");
        quantidadeComentarios.textContent = await contarComentariosNoticia(noticia.idNoticia);
        
        botaoComentarios.addEventListener("click", async (e) => {
          document.getElementById("listaComentarios").innerHTML = "";
          exibirModal(modalComentarios, e);
              
          if (await contarComentariosNoticia(noticia.idNoticia) == 0) {
            document.getElementById("listaComentarios").innerHTML = "<p>Esta notícia não possui nenhum comentário.</p>";
          } else {
            paginaComentarios = 1;
            await exibirComentariosNoticia(noticia.idNoticia, quantidadeComentarios);
          }
              
          document.getElementById("adicionarComentario").onclick = () => {
            exibirModal(modalAdicionarComentario, e);
          };
              
          document.getElementById("confirmarComentario").onclick = async () => {
            let comentario = document.getElementById("descricaoComentario");
            if (comentario.value.trim().length > 0) {
              document.getElementById("confirmarComentario").disabled = true;
              document.getElementById("descricaoComentario").disabled = true;
              
              await comentarNoticia(comentario.value.trim(), noticia.idNoticia);
                          
              document.getElementById("listaComentarios").innerHTML = "";
              paginaComentarios = 1;
              await exibirComentariosNoticia(noticia.idNoticia, quantidadeComentarios);
                          
              esconderModal(modalAdicionarComentario);
              document.getElementById("confirmarComentario").disabled = false;
              document.getElementById("descricaoComentario").disabled = false;
              comentario.value = "";
              quantidadeComentarios.textContent = await contarComentariosNoticia(noticia.idNoticia);
            }
          }
        });

        comentarios.appendChild(quantidadeComentarios);
        comentarios.appendChild(document.createTextNode(" comentários"));
        comentarios.appendChild(document.createElement("br"));
        
        metadados.appendChild(botaoComentarios);
        metadados.appendChild(comentarios);

        // Denúncias
        const botaoDenunciar = document.createElement("button");
        botaoDenunciar.classList.add("denunciar-btn");
        botaoDenunciar.textContent = "Denunciar";
        metadados.appendChild(botaoDenunciar);

        noticiaDiv.appendChild(metadados);
  
        noticiasUsuario.appendChild(noticiaDiv);
      }
  
      // Paginação
      const totalPaginas = Math.ceil(data.totalNoticias / 10);
      for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
  
        if (i === pagina) {
          btn.disabled = true;
          btn.classList.add("ativo");
        }
      
        btn.onclick = () => {
          document.querySelectorAll("#paginacaoNoticias button").forEach(b => {
            b.classList.remove("ativo");
            b.disabled = false;
          });
  
          btn.classList.add("ativo");
          btn.disabled = true;
  
          capturarNoticiasDoUsuario(i);
        };
  
        paginacaoNoticias.appendChild(btn);
      }
    }
  } catch (error) {
    console.log(error);
    await exibirAlertaErro("error", "Erro", error.message);
  }
}
 
function formatarDataNoticia(dataString) {
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
 
  const [data, hora] = dataString.split(' ');
  const [ano, mes, dia] = data.split('-');
  const [horaStr, minuto] = hora.split(':');
 
  return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${ano}, ${horaStr}:${minuto}`;
}

async function verificaAmizade(apelido1, apelido2) {
  try {
    const res = await fetch(`/usuario/verifica-amizade/${encodeURIComponent(apelido1)}/${encodeURIComponent(apelido2)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao verificar amizade!");
      throw new Error(errorData.message || "Erro ao verificar amizade");
    }

    const data = await res.json();
    return data.existeAmizade; // true ou false

  } catch (error) {
    console.error("Erro na requisição de amizade:", error);
    return null;
  }
}

async function seguirUsuario(apelido1, apelido2) {
  try {
    const res = await fetch(`/usuario/seguir-usuario/${encodeURIComponent(apelido1)}/${encodeURIComponent(apelido2)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao seguir usuário!");
      throw new Error(errorData.message || "Erro ao seguir usuário");
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Erro ao seguir usuário:", error);
    return null;
  }
}

async function deixarDeSeguirUsuario(apelido1, apelido2) {
  try {
    const res = await fetch(`/usuario/deixar-seguir-usuario/${encodeURIComponent(apelido1)}/${encodeURIComponent(apelido2)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao deixar de seguir!");
      throw new Error(errorData.message || "Erro ao deixar de seguir");
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Erro ao deixar de seguir:", error);
    return null;
  }
}

async function contarSeguidores(apelido) {
  try {
    const res = await fetch(`/usuario/contar-seguidores/${encodeURIComponent(apelido)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao contar seguidores!");
      throw new Error(errorData.message || "Erro ao contar seguidores!");
    }

    const data = await res.json();

    if (data.statusCode != 200) {
      await exibirAlertaErro("error", "Erro", data.message);
      return 0;
    } else {
      return data.quantidadeSeguidores;
    }
  } catch (error) {
    console.error("Erro ao contar seguidores:", error);
    return 0;
  }
}

async function contarSeguindo(apelido) {
  try {
    const res = await fetch(`/usuario/contar-seguindo/${encodeURIComponent(apelido)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao contar seguindo!");
      throw new Error(errorData.message || "Erro ao contar seguindo!");
    }

    const data = await res.json();
    if (data.statusCode != 200) {
      await exibirAlertaErro("error", "Erro", data.message);
      return 0;
    } else {
      return data.quantidadeSeguindo;
    }
  } catch (error) {
    console.error("Erro ao contar seguindo:", error);
    return 0;
  }
}

async function verificarCurtidaNoticia(idNoticia, apelido) {
  try {
    const res = await fetch('/noticia/verifica-curtida-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida de notícia!");
      throw new Error(data.message || "Erro ao verificar curtida de notícia");
    }

    return data.existeCurtidaNoticia;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function contarCurtidasNoticia(idNoticia) {
  try {
    const res = await fetch('/noticia/contar-curtidas-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNoticia }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas da notícia!");
      throw new Error(data.message || "Erro ao contar curtidas da notícia");
    }

    return data.quantidadeCurtidasNoticia;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function curtirOuDescurtirNoticia(idNoticia, quantidadeCurtidas, botaoCurtir) {
  let usuarioCurtiuEstaNoticia = await verificarCurtidaNoticia(idNoticia, apelido);

  if (usuarioCurtiuEstaNoticia > 0) {
    const resultado = await removerCurtidaNoticia(idNoticia);

    if (resultado.statusCode == 200) {
      if (botaoCurtir.classList.contains("active")) {
        botaoCurtir.classList.remove("active");
      }

      botaoCurtir.textContent = "Curtir";
      quantidadeCurtidas.textContent = parseInt(quantidadeCurtidas.textContent) - 1;
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  } else {
    const resultado = await curtirNoticia(idNoticia);

    if (resultado.statusCode == 200) {
      if (!botaoCurtir.classList.contains("active")) {
        botaoCurtir.classList.add("active");
      }

      botaoCurtir.textContent = "Remover curtida";
      quantidadeCurtidas.textContent = parseInt(quantidadeCurtidas.textContent) + 1;
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  }
}

async function curtirNoticia(idNoticia) {
  try {
    const res = await fetch('/noticia/curtir-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao curtir notícia!");
      throw new Error(data.message || "Erro ao curtir notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao curtir notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function removerCurtidaNoticia(idNoticia) {
  try {
    const res = await fetch('/noticia/remover-curtida-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao remover curtida da notícia!");
      throw new Error(data.message || "Erro ao remover curtida da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao remover curtida da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function contarComentariosNoticia(idNoticia) {
  try {
    const res = await fetch('/noticia/contar-comentarios-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNoticia }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao contar comentários da notícia!");
      throw new Error(data.message || "Erro ao contar comentários da notícia");
    }

    return data.quantidadeComentariosNoticia;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao contar comentários da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function comentarNoticia(comentario, idNoticia) {
  try {
    const res = await fetch('/noticia/comentar-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentario, idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao comentar notícia!");
      throw new Error(data.message || "Erro ao comentar notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao comentar notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function capturarComentariosNoticia(idNoticia, paginaComentarios = 1) {
  try {
    const res = await fetch(
      `/noticia/capturar-comentarios-noticia/${encodeURIComponent(idNoticia)}/${encodeURIComponent(paginaComentarios)}`
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      await exibirAlertaErro("error", "Erro", "Erro ao buscar comentários da notícia!");
      throw new Error(errorData.message || "Erro ao buscar comentários da notícia");
    }

    const data = await res.json();

    return {
      comentarios: data.comentarios,
      totalComentarios: data.totalComentarios
    };
  } catch (error) {
    console.error(error);
    await exibirAlertaErro("error", "Erro", error.message);
    return { comentarios: [], totalComentarios: 0 };
  }
}

async function verificarCurtidaComentarioNoticia(idComentario, apelido) {
  try {
    const res = await fetch('/noticia/verifica-curtida-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida do comentário da notícia!");
      throw new Error(data.message || "Erro ao verificar curtida do comentário da notícia");
    }

    return data.existeCurtidaComentarioNoticia;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida do comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function contarCurtidasComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/contar-curtidas-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas do comentário da notícia!");
      throw new Error(data.message || "Erro ao contar curtidas do comentário da notícia");
    }

    return data.quantidadeCurtidasComentarioNoticia;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas do comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function curtirOuDescurtirComentarioNoticia(idComentario, quantidadeCurtidasComentario, botaoCurtirComentario) {
  let usuarioCurtiuEsteComentario = await verificarCurtidaComentarioNoticia(idComentario, apelido);

  if (usuarioCurtiuEsteComentario > 0) {
    const resultado = await removerCurtidaComentarioNoticia(idComentario);

    if (resultado.statusCode == 200) {
      if (botaoCurtirComentario.classList.contains("active")) {
        botaoCurtirComentario.classList.remove("active");
      }

      botaoCurtirComentario.textContent = "Curtir";
      quantidadeCurtidasComentario.textContent = parseInt(quantidadeCurtidasComentario.textContent) - 1;
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  } else {
    const resultado = await curtirComentarioNoticia(idComentario);

    if (resultado.statusCode == 200) {
      if (!botaoCurtirComentario.classList.contains("active")) {
        botaoCurtirComentario.classList.add("active");
      }

      botaoCurtirComentario.textContent = "Remover curtida";
      quantidadeCurtidasComentario.textContent = parseInt(quantidadeCurtidasComentario.textContent) + 1;
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  }
}

async function curtirComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/curtir-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao curtir comentário da notícia!");
      throw new Error(data.message || "Erro ao curtir comentário da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao curtir comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function removerCurtidaComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/remover-curtida-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao remover curtida do comentário da notícia!");
      throw new Error(data.message || "Erro ao remover curtida do comentário da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao remover curtida do comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function editarComentarioNoticia(comentarioEditado, idComentario) {
  try {
    const res = await fetch('/noticia/editar-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentarioEditado, idComentario }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao editar comentário da notícia!");
      throw new Error(data.message || "Erro ao editar comentário da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao editar comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function apagarComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/apagar-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao apagar comentário da notícia!");
      throw new Error(data.message || "Erro ao apagar comentário da notícia");
    }

    return data;
  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao apagar comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function exibirComentariosNoticia(idNoticia, quantidadeComentarios) {
  const comentariosNoticia = await capturarComentariosNoticia(idNoticia, paginaComentarios);

  for (let i = 0; i < comentariosNoticia.comentarios.length; i++) {
    const comentarioNoticia = comentariosNoticia.comentarios[i];
    const comentario = document.createElement("div");
    comentario.classList.add("comentario");

    const comentarioCabecalho = document.createElement("header");
            
    const ladoEsquerdoCabecalho = document.createElement("div");
    ladoEsquerdoCabecalho.classList.add("lado-esquerdo");
    const ladoDireitoCabecalho = document.createElement("div");
    ladoDireitoCabecalho.classList.add("lado-direito");

    const fotoAutorComentario = document.createElement("img");
    fotoAutorComentario.src = comentarioNoticia.fotoPerfil;

    ladoEsquerdoCabecalho.appendChild(fotoAutorComentario);
    comentarioCabecalho.appendChild(ladoEsquerdoCabecalho);

    if (comentarioNoticia.apelido == apelido) {
      const apelidoAutorComentario = document.createElement("p");
      apelidoAutorComentario.textContent = comentarioNoticia.apelido;
      ladoDireitoCabecalho.appendChild(apelidoAutorComentario)
    } else {
      const apelidoAutorComentario = document.createElement("a");
      apelidoAutorComentario.textContent = comentarioNoticia.apelido;
      apelidoAutorComentario.style.textDecoration = "underline";
      apelidoAutorComentario.href = `perfil/${comentarioNoticia.apelido}`;

      ladoDireitoCabecalho.appendChild(apelidoAutorComentario)
    }

    const dataComentario = document.createElement("p");
    dataComentario.textContent = "Data publicação: " + formatarDataNoticia(comentarioNoticia.dataComentario);
    ladoDireitoCabecalho.appendChild(dataComentario);
    comentarioCabecalho.appendChild(ladoDireitoCabecalho);

    const comentarioMain = document.createElement("main");
    const textoComentario = document.createElement("p");
    textoComentario.textContent = comentarioNoticia.comentario;
    comentarioMain.appendChild(textoComentario);

    const comentarioRodape = document.createElement("footer");
    const botaoCurtirComentario = document.createElement("button");
    botaoCurtirComentario.classList.add("curtir-btn");

    let usuarioCurtiuEsteComentario = await verificarCurtidaComentarioNoticia(comentarioNoticia.idComentario, apelido);
    if (usuarioCurtiuEsteComentario > 0) {
      botaoCurtirComentario.classList.add("active");
      botaoCurtirComentario.textContent = "Remover curtida";
    } else {
      botaoCurtirComentario.textContent = "Curtir";
    }

    const curtidasComentario = document.createElement("span");
    const quantidadeCurtidasComentario = document.createElement("b");
    quantidadeCurtidasComentario.textContent = await contarCurtidasComentarioNoticia(comentarioNoticia.idComentario);

    curtidasComentario.appendChild(quantidadeCurtidasComentario);
    curtidasComentario.appendChild(document.createTextNode(" curtidas"));
    curtidasComentario.appendChild(document.createElement("br"));

    botaoCurtirComentario.addEventListener("click", function() {
      curtirOuDescurtirComentarioNoticia(comentarioNoticia.idComentario, quantidadeCurtidasComentario, botaoCurtirComentario);
    });

    comentarioRodape.appendChild(botaoCurtirComentario);
    comentarioRodape.appendChild(curtidasComentario);

    if (comentarioNoticia.apelido == apelido) {
      // Link editar
      const linkEditarComentario = document.createElement("a");
      linkEditarComentario.classList.add("editar-comentario");
      linkEditarComentario.textContent = "Editar comentário";

      linkEditarComentario.onclick = (e) => {
        // guarda o id do comentário selecionado no botão confirmar
        document.getElementById("confirmarExcluirComentario").dataset.idComentario = comentarioNoticia.idComentario;

        document.getElementById("descricaoEditarComentario").value = textoComentario.textContent;
        exibirModal(modalEditarComentario, e);
      };

      document.getElementById("confirmarEditarComentario").onclick = async () => {
        const idComentarioAtual = document.getElementById("confirmarExcluirComentario").dataset.idComentario;
        let comentarioEditado = document.getElementById("descricaoEditarComentario").value.trim();
        
        if (comentarioEditado.length > 0) {
          document.getElementById("confirmarExcluirComentario").disabled = true;
          document.getElementById("confirmarEditarComentario").disabled = true;
          document.getElementById("descricaoEditarComentario").disabled = true;

          await editarComentarioNoticia(comentarioEditado, idComentarioAtual);

          document.getElementById("listaComentarios").innerHTML = "";
          paginaComentarios = 1;
          await exibirComentariosNoticia(idNoticia, quantidadeComentarios);

          esconderModal(modalEditarComentario);
          document.getElementById("confirmarExcluirComentario").disabled = false;
          document.getElementById("confirmarEditarComentario").disabled = false;
          document.getElementById("descricaoEditarComentario").disabled = false;

          document.getElementById("descricaoEditarComentario").value = "";
          textoComentario.textContent = comentarioEditado;
        }
      }
      document.getElementById("confirmarExcluirComentario").onclick = async () => {
        const idComentarioAtual = document.getElementById("confirmarExcluirComentario").dataset.idComentario;
        document.getElementById("confirmarExcluirComentario").disabled = true;
        document.getElementById("confirmarEditarComentario").disabled = true;
        document.getElementById("descricaoEditarComentario").disabled = true;

        await apagarComentarioNoticia(idComentarioAtual);

        if (await contarComentariosNoticia(idNoticia) == 0) {
          document.getElementById("listaComentarios").innerHTML = "<p>Esta notícia não possui nenhum comentário.</p>";
        } else {
          document.getElementById("listaComentarios").innerHTML = "";
          paginaComentarios = 1;
          await exibirComentariosNoticia(idNoticia, quantidadeComentarios);
        }
        
        esconderModal(modalEditarComentario);
        document.getElementById("confirmarExcluirComentario").disabled = false;
        document.getElementById("confirmarEditarComentario").disabled = false;
        document.getElementById("descricaoEditarComentario").disabled = false;

        document.getElementById("descricaoEditarComentario").value = "";
        quantidadeComentarios.textContent = await contarComentariosNoticia(idNoticia);
      }
      comentarioRodape.appendChild(linkEditarComentario);
    } else {
      // Denúncias
      const botaoDenunciarComentario = document.createElement("button");
      botaoDenunciarComentario.classList.add("denunciar-btn");
      botaoDenunciarComentario.textContent = "Denunciar";
      comentarioRodape.appendChild(botaoDenunciarComentario);
    }
            
    comentario.appendChild(comentarioCabecalho);
    comentario.appendChild(comentarioMain);
    comentario.appendChild(comentarioRodape);

    // Se for o último elemento da página
    if (i === comentariosNoticia.comentarios.length - 1) {
      const observer = new IntersectionObserver((entries, observerRef) => {
        entries.forEach(async entry => {
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            observerRef.unobserve(entry.target);

            // verifica se ainda há comentários para carregar
            const totalComentarios = parseInt(quantidadeComentarios.textContent, 10); // Total geral
            const comentariosAtuais = comentariosNoticia.comentarios.length; // Comentários na página atual

            if ((paginaComentarios * comentariosAtuais) < totalComentarios) {
              paginaComentarios++;
              await exibirComentariosNoticia(idNoticia, quantidadeComentarios);
            }
          }
        });
      }, {
        threshold: 1.0 // Só dispara quando 100% visível
      });

      observer.observe(comentario);
    }
    
    document.getElementById("listaComentarios").appendChild(comentario);
  }
}

const barraDePesquisa = document.getElementById("barraDePesquisa");

barraDePesquisa.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && barraDePesquisa.value.trim() != "") {
    window.location.href = `resultados-pesquisa.html?busca=${barraDePesquisa.value.trim()}`;
  }
});