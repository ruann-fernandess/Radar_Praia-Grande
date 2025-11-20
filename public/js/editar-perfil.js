import { exibirAlertaErroERedirecionar, exibirAlertaSucesso, exibirAlertaErro, exibirAlertaConfirmar } from "./alert.js";

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
  let arquivosEditados = {};

 fetch("/usuario/editar-perfil")
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
    apelidoSpan.textContent = data.apelido;
    emailSpan.textContent = data.email;
    nomeSpan.textContent = data.nome;
    fotoPerfilImg.src = data.fotoPerfil;
    fotoCapaImg.src = data.fotoCapa;
    biografiaSpan.textContent = data.biografia;
  })
  .catch(async (err) => {
    console.error(err.message);
    await exibirAlertaErroERedirecionar("error", "Erro", err.message, "/login.html");
  });

function editarCampo(span, campo, tipo = "text") {
  // Verifica se já está em modo de edição
  const inputExistente = span.querySelector("input");

  if (inputExistente) {
    // Volta para o valor original
    span.textContent = inputExistente.defaultValue || "Não informado";
    delete dadosEditados[campo];
    return;
  }

  const valorAtual = span.textContent.trim() || "Não informado";

  const input = document.createElement("input");
  input.type = tipo;
  input.value = valorAtual;
  input.defaultValue = valorAtual;
  input.classList.add("input-editar");

  if (campo == "biografia") {
    input.maxLength = 200;
  } else {
    input.maxLength = 100;
  }

  span.innerHTML = "";
  span.appendChild(input);
  salvarBtn.classList.remove("hidden");

  input.addEventListener("input", () => {
    dadosEditados[campo] = input.value;
  });
}

function editarImagem(container, campo, imgElement) {
  const parent = container.parentElement;
  let input = parent.querySelector("input[type='file']");

  // Se o input ainda não existe, cria e adiciona
  if (!input) {
    input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    parent.appendChild(input);

    input.addEventListener("change", () => {
      const file = input.files[0];
      if (file) {
        arquivosEditados[campo] = file;

        const reader = new FileReader();
        reader.onload = (e) => {
          imgElement.src = e.target.result; // Atualiza a imagem
        };
        reader.readAsDataURL(file);

        salvarBtn.classList.remove("hidden");
      }

      input.value = "";
    });
  }

  // Sempre que clicar no botão, abre o seletor
  input.click();
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

  
salvarBtn.addEventListener("click", async () => {
  try {
    const apelidoUsuario = document.getElementById("apelido").textContent;

    const uploads = [];

    if (arquivosEditados["fotoPerfil"]) {
      const formDataPerfil = new FormData();
      formDataPerfil.append("imagem", arquivosEditados["fotoPerfil"]);
      formDataPerfil.append("idNoticia", "");
      formDataPerfil.append("apelido", apelidoUsuario);
      formDataPerfil.append("identificador", "Ícone");

      // Adiciona a promessa ao array uploads para aguardar depois
      uploads.push(fetch("/imagem/update", {
        method: "POST",
        body: formDataPerfil
      }));
    }

    if (arquivosEditados["fotoCapa"]) {
      const formDatafotoCapa = new FormData();
      formDatafotoCapa.append("imagem", arquivosEditados["fotoCapa"]);
      formDatafotoCapa.append("idNoticia", "");
      formDatafotoCapa.append("apelido", apelidoUsuario);
      formDatafotoCapa.append("identificador", "Banner");

      uploads.push(fetch("/imagem/update", {
        method: "POST",
        body: formDatafotoCapa
      }));
    }

    // Aguarda o upload das imagens, se houverem
    if (uploads.length > 0) {
      const results = await Promise.all(uploads);
      const failed = results.some(res => !res.ok);
      if (failed) {
        await exibirAlertaErro("error", "Erro", "Erro ao enviar imagens!");
        throw new Error("Falha ao enviar imagens.");
      }
    }

    // Agora que as imagens foram enviadas, envia os demais dados do perfil
    const resposta = await fetch("/usuario/editar-perfil", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dadosEditados)
    });

    const resultado = await resposta.json();

    if (resposta.ok && resultado.statusCode === 200) {
      await exibirAlertaSucesso("Alterações salvas!");
      location.reload();
    } else {
      await exibirAlertaErro("error", "Erro", "Erro ao atualizar perfil!");
    }
  } catch (err) {
    console.error(err);
    await exibirAlertaErro("error", "Erro", "Erro ao salvar alterações!");
  }
});


  apagarBtn.addEventListener("click", async () => {
     const confirmar = await exibirAlertaConfirmar('Excluir?', 'Tem certeza que deseja excluir seu perfil? Essa ação é irreversível.');
    if (!confirmar) return;
  
    try {
      const resposta = await fetch("/usuario/editar-perfil", {
        method: "DELETE"
      });
  
      const resultado = await resposta.json();
  
        if(resultado.statusCode == 200){
          await exibirAlertaSucesso(resultado.message);
        } else{
          await exibirAlertaErro(resultado.message);
        }

      if (resultado.redirect) {
        window.location.href = resultado.redirect;
      }
    } catch (erro) {
      await exibirAlertaErro("error", "Erro", "Erro ao tentar apagar perfil!");
      console.error(erro);
    }
  });
});

// Seleciona todas as barras de pesquisa pela classe
const barrasDePesquisa = document.querySelectorAll(".barraDePesquisa");

// Adiciona o evento a cada barra
barrasDePesquisa.forEach(barra => {
  // Atualiza a outra barra enquanto digita
  barra.addEventListener("input", function() {
    barrasDePesquisa.forEach(outraBarra => {
      if (outraBarra !== barra) {
        outraBarra.value = barra.value;
      }
    });
  });

  // Redireciona ao apertar Enter
  barra.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && barra.value.trim() !== "") {
      window.location.href = `/resultados-pesquisa.html?busca=${encodeURIComponent(barra.value.trim())}`;
    }
  });
});
