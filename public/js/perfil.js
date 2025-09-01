import { exibirAlertaErro, exibirAlertaErroERedirecionar} from "./alert.js";
 
let apelido = "";
 
document.addEventListener("DOMContentLoaded", () => {
  const apelidoSpan = document.getElementById("apelido");
  const fotoPerfilImg = document.getElementById("fotoPerfil");
  const fotoCapaImg = document.getElementById("fotoCapa");
  const biografiaSpan = document.getElementById("biografia");
  const quantidadeSeguidores = document.getElementById("quantidadeSeguindo");
  const quantidadeSeguindo = document.getElementById("quantidadeSeguidores");
 
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
  .then(async (data) => {
    apelido = data.apelido;
    apelidoSpan.textContent = data.apelido;
    fotoPerfilImg.src = data.fotoPerfil;
    fotoCapaImg.src = data.fotoCapa;
    biografiaSpan.textContent = data.biografia;
    quantidadeSeguidores.textContent = await contarSeguidores(apelido);
    quantidadeSeguindo.textContent = await contarSeguindo(apelido);

    capturarNoticiasDoUsuario(apelido, 1);
  })
  .catch(async (err) => {
    console.error(err.message);
    await exibirAlertaErroERedirecionar("error", "Erro", err.message, "/login.html");
  });
});
 
async function capturarNoticiasDoUsuario(apelido, pagina = 1) {
  try {
    const res = await fetch(`/noticia/capturar-noticias-usuario/${encodeURIComponent(apelido)}?pagina=${pagina}`);
            if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao buscar notícias!");
            throw new Error(errorData.message || "Erro ao buscar notícias");
        }
 
    const data = await res.json();
 
    const noticiasUsuario = document.getElementById("noticiasUsuario");
    const paginacaoNoticias = document.getElementById("paginacaoNoticias");
 
    noticiasUsuario.innerHTML = "";
    paginacaoNoticias.innerHTML = "";
 
    // Se o usuário não tiver nenhuma notícia cadastrada
    if (data.noticias.length == 0) {
      noticiasUsuario.style.textAlign = "center";
      noticiasUsuario.innerHTML = "Nenhuma notícia foi encontrada.";
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
      metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Autor: ${noticia.apelido}` }));
 
      const dataFormatada = formatarDataNoticia(noticia.dataNoticia);
      metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Data de criação: ${dataFormatada}` }));
 
      noticiaDiv.appendChild(metadados);
 
      // Link editar
      const linkEditar = document.createElement("a");
      linkEditar.href = `editar-noticia.html?idNoticia=${encodeURIComponent(noticia.idNoticia)}`;
      linkEditar.textContent = "Editar notícia";
      noticiaDiv.appendChild(linkEditar);
 
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