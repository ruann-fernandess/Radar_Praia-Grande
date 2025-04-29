document.addEventListener("DOMContentLoaded", () => {
  const apelidoSpan = document.getElementById("apelido");
  const emailSpan = document.getElementById("email");
  const nomeSpan = document.getElementById("nome");
  const fotoPerfilImg = document.getElementById("fotoPerfil");
  const fotoCapaImg = document.getElementById("fotoCapa");
  const biografiaSpan = document.getElementById("biografia");
  const salvarBtn = document.getElementById("salvar-btn");
  const apagarBtn = document.getElementById("apagar-perfil-btn")

  let dadosEditados = {};


  fetch("/usuario/editar-perfil")
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
      apelidoSpan.textContent = data.apelido;
      emailSpan.textContent = data.email;
      nomeSpan.textContent = data.nome;
      fotoPerfilImg.src = data.fotoPerfil;
      fotoCapaImg.src = data.fotoCapa;
      biografiaSpan.textContent = data.biografia;
    })
    .catch((err) => {
      console.error("❌ Erro ao carregar perfil:", err.message);
      alert(err.message);
      window.location.href = "/login.html";
    });

  function editarCampo(span, campo, tipo = "text") {
    const valorAtual = span.textContent || span.querySelector("img")?.src || "";
    const input = document.createElement("input");
    input.type = tipo;
    input.value = valorAtual;
    span.innerHTML = "";
    span.appendChild(input);
    salvarBtn.classList.remove("hidden");

    input.addEventListener("input", () => {
      dadosEditados[campo] = input.value;
    });
  }

  document.getElementById("editar-email").addEventListener("click", () => editarCampo(emailSpan, "email"));
  document.getElementById("editar-nome").addEventListener("click", () => editarCampo(nomeSpan, "nome"));
  document.getElementById("editar-fotoPerfil").addEventListener("click", () => 
  editarImagem(document.getElementById("fotoPerfil-text"), "fotoPerfil", fotoPerfilImg)
);

document.getElementById("editar-fotoCapa").addEventListener("click", () => 
  editarImagem(document.getElementById("fotoCapa-text"), "fotoCapa", fotoCapaImg)
);

  document.getElementById("editar-biografia").addEventListener("click", () => editarCampo(biografiaSpan, "biografia"));
  
  function editarImagem(container, campo, imgElement) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    container.innerHTML = "";
    container.appendChild(input);
    salvarBtn.classList.remove("hidden");
  
    input.addEventListener("change", () => {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          const base64 = e.target.result;
          imgElement.src = base64;
          dadosEditados[campo] = base64;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  salvarBtn.addEventListener("click", () => {
    fetch("/usuario/editar-perfil", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosEditados)
    })
    .then(res => res.json())
    .then(data => {
      if (data.statusCode === 200) {
        alert("✅ Perfil atualizado com sucesso!");
        location.reload(); 
      } else {
        alert("❌ Erro: " + data.message);
      }
    })
    .catch(err => {
      console.error("Erro na requisição:", err);
      alert("❌ Erro ao salvar alterações.");
    });
  });

  apagarBtn.addEventListener("click", async () => {
    const confirmar = confirm("Tem certeza que deseja apagar seu perfil? Essa ação é irreversível.");
  
    if (!confirmar) return;
  
    try {
      const resposta = await fetch("/usuario/editar-perfil", {
        method: "DELETE"
      });
  
      const resultado = await resposta.json();
  
      alert(resultado.message);
  
      if (resultado.redirect) {
        window.location.href = resultado.redirect;
      }
    } catch (erro) {
      alert("❌ Ocorreu um erro ao tentar apagar o perfil.");
      console.error(erro);
    }
  });
});
