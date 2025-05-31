import { exibirAlertaErro, exibirAlertaErroERedirecionar, exibirAlertaSucesso } from "./alert.js";

let apelido = "";
let dadosNoticia = "";
const btnExcluir = document.getElementById('apagarNoticia');

fetch("/usuario/perfil")
    .then(async (res) => {
        const contentType = res.headers.get("content-type");
        const responseText = await res.text();
    
        if (!res.ok) {
            if (contentType && contentType.includes("application/json")) {
                const errorData = JSON.parse(responseText);
                await exibirAlertaErro("error", "Erro", "Erro desconhecido!")
                throw new Error(errorData.message || "Erro desconhecido");
            }
            await exibirAlertaErro("error", "Erro", "Erro ao carregar perfil!")
            throw new Error("Erro ao carregar perfil. O servidor retornou HTML inesperado.");
        }
    
        return JSON.parse(responseText);
    })
    .then((data) => {
        apelido = data.apelido;

        carregarNoticia();
    })
    .catch(async(err) => {
        console.error(err.message);
        await exibirAlertaErroERedirecionar("error", "Erro", err.message, "/login.html");
    });

async function carregarNoticia() {
    const urlParams = new URLSearchParams(window.location.search);
    const idNoticia = urlParams.get('idNoticia');

    if (!idNoticia || !apelido) {
        await exibirAlertaErro("question", "Falta informações", "ID da notícia ou apelido não fornecido.");
        return;
    }

    try {
        const listaBairros = document.getElementById("listaBairros");
        const res = await fetch(`/noticia/capturar-noticia-usuario/${encodeURIComponent(idNoticia)}`);

        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao buscar notícia!");
            throw new Error(errorData.message || "Erro ao buscar notícia"); 
        }

        dadosNoticia = await res.json();
        dadosNoticia = dadosNoticia.noticia;

        // Preencher bairro
        let bairroCadastrado = document.createElement("option");
        bairroCadastrado.value = dadosNoticia.siglaBairro;
        bairroCadastrado.textContent = dadosNoticia.nomeBairro;
        bairroCadastrado.setAttribute("selected", true);
        listaBairros.appendChild(bairroCadastrado);

        // Preencher descrição
        let descricao = document.getElementById("descricao");
        descricao.value = dadosNoticia.legenda;

        if (dadosNoticia.imagens.length > 0) {
            exemploItemImagem.style.display = "none";

            const dataTransfer = new DataTransfer(); // Para simular o input de arquivos

            dadosNoticia.imagens.forEach((img, index) => {
                contadorImagens++;

                // Simula arquivo a partir da base64
                const byteString = atob(img.imagem.split(',')[1]);
                const mimeString = img.imagem.split(',')[0].split(':')[1].split(';')[0];

                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                const blob = new Blob([ab], { type: mimeString });
                const fileName = `imagem-${img.idImagem}.${mimeString.split('/')[1]}`;
                const file = new File([blob], fileName, { type: mimeString });

                arrayImagens.push(file);
                dataTransfer.items.add(file); // Adiciona ao input file

                // Adiciona visualmente à tabela
                const trItemImagem = document.createElement("tr");
                trItemImagem.classList.add("itemImagem");

                const tdPreviewImagem = document.createElement("td");
                const previewImagem = document.createElement("img");
                previewImagem.src = img.imagem;
                previewImagem.alt = `Imagem ${index + 1}`;
                tdPreviewImagem.appendChild(previewImagem);

                const tdNomeImagem = document.createElement("td");
                tdNomeImagem.title = fileName;
                tdNomeImagem.textContent = fileName.split('.')[0];

                const tdStatusImagem = document.createElement("td");
                tdStatusImagem.textContent = "--";

                const tdRemoverImagem = document.createElement("td");
                const botaoRemoverImagem = document.createElement("button");
                botaoRemoverImagem.type = "button";
                botaoRemoverImagem.textContent = "Remover";
                botaoRemoverImagem.addEventListener("click", function () {
                    removerImagemDaLista(file);
                    trItemImagem.remove();
                    atualizarInputImagens();
                });

                tdRemoverImagem.appendChild(botaoRemoverImagem);

                trItemImagem.appendChild(tdPreviewImagem);
                trItemImagem.appendChild(tdNomeImagem);
                trItemImagem.appendChild(tdStatusImagem);
                trItemImagem.appendChild(tdRemoverImagem);

                listaImagens.appendChild(trItemImagem);
            });

            // Atualiza input file com as imagens do banco
            inputImagens.files = dataTransfer.files;
        }

        // Adicionando função de apagar notícia
        btnExcluir.addEventListener('click', async () => {
            const confirmar = confirm('Tem certeza que deseja excluir a notícia?');

            if (confirmar) {
                try {
                    const response = await fetch('/noticia/apagar-noticia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idNoticia }),
                    });
                    
                    await exibirAlertaSucesso("Notícia excluída!");
                    window.location.href = "perfil.html";
                } catch (error) {
                    await exibirAlertaErro("error", "Erro", "Erro ao apagar notícia!");
                    console.error('Erro na requisição: ' + error.message);
                }
            }
        });

    } catch (error) {
        await exibirAlertaErroERedirecionar("error", "Erro", "Erro ao carregar notícia!", "/perfil.html");
    }
}

// Adicionando os bairros disponíveis num array
let arrayBairros = [];

async function capturarBairros() {
    try {
        const res = await fetch("noticia/capturar-bairros");
        if (!res.ok) {
            const errorData = await res.json();
            if (res.statusCode !== 200) {
                await exibirAlertaErro("error", "Erro", res.message);
            }
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
    } catch (res) {
        exibirAlertaErro("error", "Erro", res.message);
    }
}

capturarBairros();

const inputImagens = document.getElementById("imagens");
const listaImagens = document.getElementById("listaImagens");
const exemploItemImagem = document.getElementById("exemploItemImagem");
let arrayImagens = [];
let contadorImagens = 0;
const arrayTiposArquivosAceitos = ["image/jpg", "image/jpeg", "image/png"];

inputImagens.addEventListener("change", async function() {
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
                        await exibirAlertaErro("warning", "Atenção", "O arquivo " + nomeArquivoAtual + " não possui um formato suportado.");
                    }
                } else {
                    await exibirAlertaErro("warning", "Atenção", "Você pode adicionar no máximo 4 imagens. Apenas os primeiros arquivos disponíveis foram adicionados.");
                    break;
                }
            }
        } else {
            await exibirAlertaErro("warning", "Atenção", "Você pode adicionar no máximo 4 imagens. Apenas os primeiros arquivos disponíveis foram adicionados.");
        }

        if (contadorImagens == 0) {
            inputImagens.value = "";

            await exibirAlertaErro("warning", "Atenção", "Selecione apenas arquivos com a extensão .jpg, .jpeg ou .png");
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
        await exibirAlertaErro("warning", "Atenção", "Insira um bairro.");
        return false;
    } else {
        if (arrayBairros.indexOf(bairroSelecionado) >= 0) {
            return true;
        } else {
            await exibirAlertaErro("warning", "Atenção", "Insira um bairro válido.");
            return false;
        }
    }
}

// Valida o texto da notícia
async function verificarDescricao() {
    let descricao = textareaDescricao.value.trim();

    if (descricao == "") {
        await exibirAlertaErro("warning", "Atenção", "Insira uma descrição.");
        return false;
    } else if (descricao.length < 4) {
        await exibirAlertaErro("warning", "Atenção", "Insira uma descrição de ao menos 5 caracteres.");

        return false;
    } else {
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
            await exibirAlertaErro("error", "Erro", "Erro ao analisar descrição da notícia!");
            throw new Error(errorData.message || "Erro ao analisar descrição da notícia"); 
        }

        const data = await res.json();
        return data;

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao analisar descrição!");
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
                await exibirAlertaErro("error", "Erro", "Erro ao analisar imagem da notícia!");
                throw new Error(errorData.message || "Erro ao analisar imagem da notícia"); 
            }

            const data = await res.json();

            if (data.statusCode !== 200) {
                await exibirAlertaErro(data.message);
            }
        } catch (error) {
            await exibirAlertaErro(error.message);
            return error;
        }
    }

    return {
        statusCode: 200
    };
}

document.getElementById("editarNoticiaForm").addEventListener("submit", async function (event) {
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
        loadingContainer.style.display = "none";
        return;
      }
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const idNoticia = urlParams.get('idNoticia');

    const noticia = { 
        ds_noticia: document.getElementById("descricao").value,
        sg_bairro: listaBairros.value,
        idNoticia: idNoticia
    };

    try {
        const res = await fetch('/noticia/editar-noticia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noticia),
        });

        const data = await res.json();

        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao editar a notícia!");
            throw new Error(errorData.message || "Erro ao editar a notícia"); 
        }

        if (data.statusCode === 200) {
            if (contadorImagens > 0) {
                // Envia as imagens usando FormData para /upload
                for (let i = 0; i < arrayImagens.length; i++) {
                    const formData = new FormData();
                    formData.append("imagem", arrayImagens[i]); // File
                    formData.append("idNoticia", idNoticia);
                    formData.append("apelido", apelido);
                    formData.append("identificador", "Notícia"); // ex: Noticia-1, Noticia-2, etc

                    try {
                        const res = await fetch("/imagem/upload", {
                            method: "POST",
                            body: formData
                        });

                        const resultado = await res.json();

                        if (!res.ok) {
                            console.error(`(${resultado.statusCode}) ${resultado.message}`);
                            await exibirAlertaErro("error", "Erro", "Uma ou mais imagens não foram enviadas corretamente.");
                            return;
                        }

                        await exibirAlertaSucesso(resultado.message);
                    } catch (erro) {
                        await exibirAlertaErro("error", "Erro", "Erro desconhecido!");
                        console.error(erro);
                        return;
                    }
                }
            }
            
            await exibirAlertaSucesso(data.message);
            window.location.href = "perfil.html";
        } else {
            await exibirAlertaErro("error", "Erro", "Erro ao editar notícia!");
            console.log(data.message);
        }
    } catch (error) {
        await exibirAlertaErro(error.message);
    }

    loadingContainer.style.display = "none";
  }
});
