import { exibirAlertaErro, exibirAlertaErroERedirecionar} from "./alert.js";

// apelido = apelido1
// apelidoOutroUsuario = apelido2
let apelido = "";
let apelidoOutroUsuario = "";
let usuario1SegueUsuario2 = 0;
let usuario2SegueUsuario1 = 0;

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
        
        usuario2SegueUsuario1 = await verificaAmizade(apelidoOutroUsuario, apelido);

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
      noticiasUsuario.style.textAlign = "center";
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
        quantidadeComentarios.id = "quantidadeComentarios";
        quantidadeComentarios.textContent = "0";

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
 
  // Exemplo: "27 de maio de 2025, 12:08"
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