let apelido = "";

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
    })
    .catch((err) => {
        console.error("❌ Erro ao carregar perfil:", err.message);
        alert(err.message);
        window.location.href = "/login.html";
    });

// Adicionando os bairros disponíveis num array
let arrayBairros = [];

async function capturarBairros() {
    try {
        const res = await fetch("noticia/capturar-bairros");
        if (!res.ok) {
            const errorData = await res.json();
            throw errorData;
        }

        const data = await res.json();
        const listaBairros = document.getElementById("listaBairros");

        for (let i = 0; i < data.bairros.length; i++) {
            let opcaoBairro = document.createElement("option");
            opcaoBairro.value = data.bairros[i].siglaBairro;
            opcaoBairro.textContent = data.bairros[i].nomeBairro;

            listaBairros.appendChild(opcaoBairro);
            arrayBairros.push(data.bairros[i].siglaBairro);
        }

        console.log(`(${data.statusCode}) ${data.message}`);
    } catch (error) {
        alert(`(${error.statusCode}) ${error.message}`);
    }
}

capturarBairros();

const inputImagens = document.getElementById("imagens");
const listaImagens = document.getElementById("listaImagens");
const exemploItemImagem = document.getElementById("exemploItemImagem");
let arrayImagens = [];
let contadorImagens = 0;
const arrayTiposArquivosAceitos = ["image/jpg", "image/jpeg", "image/png"];

inputImagens.addEventListener("change", function () {
    let novosArquivos = inputImagens.files;
    let contadorNovosArquivos = inputImagens.files.length;

    if (contadorNovosArquivos > 0) {
        if (contadorImagens < 4) {
            for (let i = 0; i < contadorNovosArquivos; i++) {
                if (contadorImagens < 4) {
                    const arquivoAtual = novosArquivos[i];

                    if (validarTipoArquivo(arquivoAtual)) {
                        arrayImagens.push(arquivoAtual);
                        contadorImagens++;

                        exemploItemImagem.style.display = "none";
                    } else {
                        const nomeArquivoAtual = arquivoAtual.name;
                        alert("O arquivo " + nomeArquivoAtual + " não possui um formato suportado.");
                    }
                } else {
                    alert("Você pode adicionar no máximo 4 imagens. Apenas os primeiros arquivos disponíveis foram adicionados.");
                    break;
                }
            }
        } else {
            alert("Você pode adicionar no máximo 4 imagens. Apenas os primeiros arquivos disponíveis foram adicionados.");
        }

        if (contadorImagens == 0) {
            inputImagens.value = "";

            alert("Selecione apenas arquivos com a extensão .jpg, .jpeg ou .png");
        } else {
            resetarListaImagens();

            for (const arquivoAtual of arrayImagens) {
                const trItemImagem = document.createElement("tr");
                trItemImagem.classList.add("itemImagem");

                const tdPreviewImagem = document.createElement("td");
                const previewImagem = document.createElement("img");

                const tdNomeImagem = document.createElement("td");
                tdNomeImagem.title = arquivoAtual.name;
                tdNomeImagem.textContent = arquivoAtual.name.split(".")[0];

                const tdStatusImagem = document.createElement("td");
                tdStatusImagem.textContent = "--";

                const tdRemoverImagem = document.createElement("td");
                const botaoRemoverImagem = document.createElement("button");
                botaoRemoverImagem.type = "button";
                botaoRemoverImagem.textContent = "Remover";
                botaoRemoverImagem.addEventListener("click", function () {
                    removerImagemDaLista(arquivoAtual);
                    trItemImagem.remove();
                    atualizarInputImagens();
                });

                tdPreviewImagem.appendChild(previewImagem);
                tdRemoverImagem.appendChild(botaoRemoverImagem);

                trItemImagem.appendChild(tdPreviewImagem);
                trItemImagem.appendChild(tdNomeImagem);
                trItemImagem.appendChild(tdStatusImagem);
                trItemImagem.appendChild(tdRemoverImagem);

                listaImagens.appendChild(trItemImagem);
            }

            atualizarInputImagens();
        }
    } else {
        atualizarInputImagens();
    }
});

function validarTipoArquivo(arquivo) {
    return arrayTiposArquivosAceitos.includes(arquivo.type);
}

function removerImagemDaLista(imagem) {
    for (let i = 0; i < contadorImagens; i++) {
        if (arrayImagens[i] == imagem) {
            arrayImagens.splice(i, 1);
            contadorImagens--;
            break;
        }
    }

    if (contadorImagens == 0) {
        exemploItemImagem.style.display = "table-row"
    }

    atualizarInputImagens();
}

function resetarListaImagens() {
    const todosItensImagens = document.querySelectorAll("tr.itemImagem");

    for (let i = 0; i < todosItensImagens.length; i++) {
        todosItensImagens[i].remove();
    }
}

function atualizarInputImagens() {
    let dataTransfer = new DataTransfer();

    for (let i = 0; i < contadorImagens; i++) {
        dataTransfer.items.add(arrayImagens[i]);

        const reader = new FileReader();

        reader.onload = function (e) {
            document.querySelectorAll("tr.itemImagem td img")[i].src = e.target.result;
        };

        reader.readAsDataURL(arrayImagens[i]);
    }

    inputImagens.files = dataTransfer.files;
}

// Textarea de descrição e seus avisos
const textareaDescricao = document.getElementById("descricao");

// Exibindo o scroll quando o textarea estiver em foco
textareaDescricao.addEventListener("focus", function () {
    textareaDescricao.style.overflowY = "auto";
});
// Escondendo o scroll quando o textarea não estiver em foco
textareaDescricao.addEventListener("blur", function () {
    textareaDescricao.style.overflowY = "hidden";
});

// Valida o bairro selecionado
async function verificarBairro() {
    const listaBairros = document.getElementById("listaBairros");
    let bairroSelecionado = listaBairros.value;

    if (bairroSelecionado == "") {
        alert("❌ Nenhum bairro foi declarado.");

        return false;
    } else {
        if (arrayBairros.indexOf(bairroSelecionado) >= 0) {
            alert("✅ O bairro selecionado é válido.");

            return true;
        } else {
            alert("❌ O bairro selecionado não é válido.");

            return false;
        }
    }
}

// Valida o texto da notícia
async function verificarDescricao() {
    let descricao = textareaDescricao.value.trim();

    if (descricao == "") {
        alert("❌ Nenhuma descrição foi declarada.");

        return false;
    } else if (descricao.length < 4) {
        alert("❌ A descrição deve ter ao menos 5 caracteres.");

        return false;
    } else {
        alert("✅ A descrição é válida.");

        return true;
    }
}

async function analisarDescricao() {
    let descricao = textareaDescricao.value.trim();

    try {
        const res = await fetch("noticia/analisar-descricao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw errorData;
        }

        const data = await res.json();
        return data;
        //alert(`(${data.statusCode}) ${data.message}`);
    } catch (error) {
        //alert(`(${error.statusCode}) ${error.message}`);
        return error;
    }
}

async function analisarImagens() {
    for (let i = 0; i < contadorImagens; i++) {
        try {
            const formData = new FormData();
            formData.append("imagem", arrayImagens[i]);

            const res = await fetch("noticia/analisar-imagem", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw errorData;
            }

            const data = await res.json();
            alert(`(${data.statusCode}) ${data.message}`);

            if (data.statusCode != 200) {
                return data;
            }
        } catch (error) {
            alert(`(${error.statusCode}) ${error.message}`);
            
            return error;
        }
    }

    return {
        statusCode: 200,
        message: "✅ Todas as imagens são válidas."
    };
}

document.getElementById("cadastronoticiaForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const loadingContainer = document.querySelector(".loading-container");
  
  const listaBairros = document.getElementById("listaBairros");

  let bairroValido = await verificarBairro();
  let descricaoValida = await verificarDescricao();

  if (bairroValido && descricaoValida) {
    loadingContainer.style.display = "flex";

    const resultadoAnalise = await analisarDescricao();

    if (resultadoAnalise.statusCode !== 200) {
      loadingContainer.style.display = "none";
      return;
    }

    if (contadorImagens > 0) {
      const resultadoImagens = await analisarImagens();

      if (resultadoImagens.statusCode !== 200) {
        alert(resultadoImagens.message);
        loadingContainer.style.display = "none";
        return;
      }
    }

    const noticia = {
      apelido: apelido,
      sg_bairro: listaBairros.value,
      ds_noticia: document.getElementById("descricao").value
    };

    // Envia a notícia
    const response = await fetch("noticia/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noticia)
    });

    const data = await response.json();
    alert(`(${data.statusCode}) ${data.message}`);

    if (data.statusCode === 200) {
        if (contadorImagens > 0) {
            // Envia as imagens usando FormData para /upload
            for (let i = 0; i < arrayImagens.length; i++) {
                const formData = new FormData();
                formData.append("imagem", arrayImagens[i]); // File
                formData.append("idNoticia", data.idNoticia);
                formData.append("apelido", apelido);
                formData.append("identificador", "Notícia"); // ex: Noticia-1, Noticia-2, etc

                try {
                    await fetch("/imagem/upload", {
                        method: "POST",
                        body: formData
                    });


                    if (!imgRes.ok) {
                        const erro = await imgRes.text();
                        console.error("Erro ao enviar imagem:", erro);
                        alert("⚠️ Uma ou mais imagens não foram enviadas corretamente.");
                    }
                } catch (erro) {
                    console.error("Erro de rede ao enviar imagem:", erro);
                }
            }
        }
        // Redireciona somente depois de todas as imagens
        window.location.href = "cadastro-noticia.html";
    }

    loadingContainer.style.display = "none";
  }
});


function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}