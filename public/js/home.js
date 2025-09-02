import { exibirAlertaErro, exibirAlertaErroERedirecionar, exibirAlertaSucesso } from "./alert.js";

let apelido = "";

document.addEventListener("DOMContentLoaded", () => {
 fetch("/usuario/perfil")
  .then(async (res) => {
    const contentType = res.headers.get("content-type");
    const responseText = await res.text();
 
    if (!res.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.message || "Erro desconhecido");
      }
      throw new Error("Erro ao carregar perfil. O servidor retornou HTML inesperado.");
    }
 
    return JSON.parse(responseText);
  })
  .then((data) => {
    apelido = data.apelido;
   
    capturarNoticias(1);
  })
  .catch(async (err) => {
    console.error(err.message);
    await exibirAlertaErroERedirecionar("error", "Erro", err.message, "/login.html");
  });
});
 
async function capturarNoticias(pagina = 1) {
  try {
    const res = await fetch(`/noticia/capturar-noticias?pagina=${pagina}`);
    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao buscar notícias!");
      throw new Error(errorData.message || "Erro ao buscar notícias");
    }
 
    const data = await res.json();
 
    const noticiasLista = document.getElementById("noticiasLista");
    const paginacaoNoticias = document.getElementById("paginacaoNoticias");
 
    noticiasLista.innerHTML = "";
    paginacaoNoticias.innerHTML = "";
 
    // Se não tiver nenhuma notícia cadastrada
    if (data.noticias.length == 0) {
      noticiasLista.style.textAlign = "center";
      noticiasLista.innerHTML = "Nenhuma notícia foi encontrada.";
      document.getElementById("paginacaoNoticias").style.display = "none";
    }
   
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
      if (noticia.apelido == apelido) {
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Autor: ${noticia.apelido}` }));
      } else {
        const autorNoticia = Object.assign(document.createElement("p"), { textContent: "Autor: " });
        const linkPerfilOutroUsuario = Object.assign(document.createElement("a"), { textContent: noticia.apelido });
        linkPerfilOutroUsuario.style.textDecoration = "underline";
        linkPerfilOutroUsuario.href = `perfil/${noticia.apelido}`;

        autorNoticia.appendChild(linkPerfilOutroUsuario)
        metadados.appendChild(autorNoticia);
      }
 
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

      if (noticia.apelido == apelido) {
        // Link editar
        const linkEditar = document.createElement("a");
        linkEditar.classList.add("editar-noticia");
        linkEditar.href = `editar-noticia.html?idNoticia=${encodeURIComponent(noticia.idNoticia)}`;
        linkEditar.textContent = "Editar notícia";
        metadados.appendChild(linkEditar);
      } else {
        // Denúncias
        const botaoDenunciar = document.createElement("button");
        botaoDenunciar.classList.add("denunciar-btn");
        botaoDenunciar.textContent = "Denunciar";
        metadados.appendChild(botaoDenunciar);
      }

      noticiaDiv.appendChild(metadados);
 
      noticiasLista.appendChild(noticiaDiv);
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
 
        capturarNoticiasDoUsuario(apelido, i);
      };
 
      paginacaoNoticias.appendChild(btn);
    }
 
    console.log(`(${data.statusCode}) ${data.message}`);
  } catch (error) {
    await exibirAlertaErro(error.message);
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