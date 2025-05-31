import { exibirAlertaErroERedirecionar, exibirAlertaErro, exibirAlertaSucesso } from "./alert.js";

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
          await exibirAlertaErro("error", "Erro", "Erro desconhecido!");
          throw new Error(errorData.message || "Erro desconhecido");
        }
        await exibirAlertaErro("error", "Erro", "Erro ao carregar perfil")
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
    .catch( async (err) => {
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

  span.innerHTML = "";
  span.appendChild(input);
  salvarBtn.classList.remove("hidden");

  input.addEventListener("input", () => {
    dadosEditados[campo] = input.value;
  });
}

function editarImagem(container, campo, imgElement) {
  const parent = container.parentElement; // container = fotoPerfil-text ou fotoCapa-text
  const inputExistente = parent.querySelector("input");

  if (inputExistente) {
    // Remove o input e volta só a imagem
    inputExistente.remove();
    delete arquivosEditados[campo];
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.classList.add("input-editar");

  parent.appendChild(input); // Adiciona fora da imagem, mas dentro do .elemento-edicao
  salvarBtn.classList.remove("hidden");

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) {
      arquivosEditados[campo] = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        imgElement.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
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
    const confirmar = confirm("Tem certeza que deseja apagar seu perfil? Essa ação é irreversível.");
  
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
