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

      noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `ID: ${noticia.idNoticia}` }));
      noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Legenda: ${noticia.legenda}` }));
      noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Data: ${noticia.dataNoticia}` }));
      noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Autor: ${noticia.apelido}` }));
      noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Sigla Bairro: ${noticia.siglaBairro}` }));
      noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Nome Bairro: ${noticia.nomeBairro}` }));

      if (noticia.imagens && noticia.imagens.length > 0) {
        const imagensContainer = document.createElement("div");
        imagensContainer.textContent = "Imagens:";
        for (const imgObj of noticia.imagens) {
          const imgEl = document.createElement("img");
          imgEl.src = imgObj.imagem;
          imgEl.alt = `Imagem ${imgObj.idImagem}`;
          imgEl.style.maxWidth = "150px";
          imgEl.style.marginRight = "10px";
          imagensContainer.appendChild(imgEl);
        }
        noticiaDiv.appendChild(imagensContainer);
      } else {
        noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: "Sem imagens." }));
      }

      const linkEditar = document.createElement("a");
      linkEditar.href = `editar-noticia.html?idNoticia=${encodeURIComponent(noticia.idNoticia)}`;
      linkEditar.textContent = "Editar notícia";
      linkEditar.style.display = "inline-block";
      linkEditar.style.marginTop = "10px";
      linkEditar.style.color = "blue";
      linkEditar.style.textDecoration = "underline";
      noticiaDiv.appendChild(linkEditar);

      noticiasUsuario.appendChild(noticiaDiv);
    }

    // Geração dinâmica da paginação
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
