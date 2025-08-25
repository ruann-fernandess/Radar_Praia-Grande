import { exibirAlertaErro, exibirAlertaErroERedirecionar} from "./alert.js";

let apelido = "";
let apelidoOutroUsuario = "";
// perfil-outro-usuario

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
    .then((data) => {
      apelidoSpan.textContent = apelidoOutroUsuario;
      fotoPerfilImg.src = data.fotoPerfil;
      fotoCapaImg.src = data.fotoCapa;
      biografiaSpan.textContent = data.biografia;

      capturarNoticiasDoUsuario(apelidoOutroUsuario, 1);
    })
    .catch(async (err) => {
      console.error(err.message);

      if (apelido != "" && apelido != null) {
        await exibirAlertaErroERedirecionar("error", "Erro", err.message, "../home.html");
      } else {
        await exibirAlertaErroERedirecionar("error", "Erro", err.message, "../index.html");
      }
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
        } else {
          noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: "Sem imagens." }));
        }
  
        // Metadados
        const metadados = document.createElement("div");
        metadados.classList.add("metadados");
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Bairro: ${noticia.nomeBairro}` }));
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Autor: ${noticia.apelido}` }));
  
        const dataFormatada = formatarDataNoticia(noticia.dataNoticia);
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Data de criação: ${dataFormatada}` }));
  
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
  
          capturarNoticiasDoUsuario(apelido, i);
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
