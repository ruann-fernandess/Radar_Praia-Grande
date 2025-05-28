let apelido = "";

document.addEventListener("DOMContentLoaded", () => {
  const apelidoSpan = document.getElementById("apelido");
  const fotoPerfilImg = document.getElementById("fotoPerfil");
  const fotoCapaImg = document.getElementById("fotoCapa");
  const biografiaSpan = document.getElementById("biografia");

  fetch("/usuario/perfil")
    .then(async (res) => {
      const contentType = res.headers.get("content-type");
      const responseText = await res.text();

      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || "Erro desconhecido");
        }
        throw new Error("⚠️ Erro ao carregar perfil. O servidor retornou HTML inesperado.");
      }

      return JSON.parse(responseText);
    })
    .then((data) => {
      apelido = data.apelido;

      apelidoSpan.textContent = data.apelido;
      fotoPerfilImg.src = data.fotoPerfil;
      fotoCapaImg.src = data.fotoCapa;
      biografiaSpan.textContent = data.biografia;
      
      capturarNoticiasDoUsuario(apelido, 1);
    })
    .catch((err) => {
      console.error("❌ Erro ao carregar perfil:", err.message);
      alert(err.message);
      window.location.href = "/login.html";
    });

  const modal = document.getElementById("confirmModal");
  const logoutBtn = document.getElementById("logout-btn");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  confirmNo.addEventListener("click", () => {
    modal.style.display = "none";
  });

  confirmYes.addEventListener("click", async () => {
    try {
      const resposta = await fetch("/usuario/logout", {
        method: "GET",
        credentials: "include"
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert(resultado.message);
        window.location.href = resultado.redirect;
      } else {
        alert("Erro ao fazer logout: " + resultado.message);
        modal.style.display = "none";
      }
    } catch (err) {
      console.error("Erro na requisição de logout:", err);
      alert("Erro inesperado no logout.");
      modal.style.display = "none";
    }
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

async function capturarNoticiasDoUsuario(apelido, pagina = 1) {
  try {
    const res = await fetch(`/noticia/capturar-noticias-usuario/${encodeURIComponent(apelido)}?pagina=${pagina}`);

    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }

    const data = await res.json();

    const noticiasUsuario = document.getElementById("noticiasUsuario");
    const paginacaoNoticias = document.getElementById("paginacaoNoticias");

    noticiasUsuario.innerHTML = "";
    paginacaoNoticias.innerHTML = "";

    for (const noticia of data.noticias) {
      const noticiaDiv = document.createElement("div");
      noticiaDiv.classList.add("noticia");

      // Legenda (descrição)
      noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: noticia.legenda }));

      // Metadados
      const metadados = document.createElement("div");
      metadados.classList.add("metadados");
      metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Bairro: ${noticia.nomeBairro} (${noticia.siglaBairro})` }));

      const dataFormatada = formatarDataNoticia(noticia.dataNoticia);
      metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Última atualização: ${dataFormatada}` }));

      noticiaDiv.appendChild(metadados);


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
      btn.style.margin = "0 5px";
      if (i === pagina) {
        btn.disabled = true;
        btn.style.fontWeight = "bold";
      }
      btn.onclick = () => capturarNoticiasDoUsuario(apelido, i);
      paginacaoNoticias.appendChild(btn);
    }

    console.log(`(${data.statusCode}) ${data.message}`);
  } catch (error) {
    alert(`(${error.statusCode}) ${error.message}`);
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