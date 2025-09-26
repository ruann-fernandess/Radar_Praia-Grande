import { exibirAlertaConfirmar, exibirAlertaErro, exibirAlertaErroERedirecionar, exibirAlertaSucesso } from "./alert.js";

let apelido = "";
let imagensNoticiaAntesEdicao = "";
let bairroNoticiaAntesEdicao = "";
let descricaoNoticiaAntesEdicao = "";
const btnExcluir = document.getElementById('apagarNoticia');

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
        if (data.admin > 0) {
            window.location.href = "/admin/consultar-usuarios.html";
        }

        apelido = data.apelido;
        capturarBairros();
        carregarNoticia();
    })
    .catch(async (err) => {
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

        let dadosNoticia = await res.json();
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

        bairroNoticiaAntesEdicao = dadosNoticia.siglaBairro;
        descricaoNoticiaAntesEdicao = dadosNoticia.legenda;

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
                trItemImagem.appendChild(tdRemoverImagem);

                listaImagens.appendChild(trItemImagem);
            });

            // Atualiza input file com as imagens do banco
            inputImagens.files = dataTransfer.files;
        }

        imagensNoticiaAntesEdicao = inputImagens.files;

        // Adicionando função de apagar notícia
        btnExcluir.addEventListener('click', async () => {
            const confirmar = await exibirAlertaConfirmar('Excluir?', 'Tem certeza que deseja excluir a notícia?');

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

        const data = await res.json();
            
        if (data.statusCode != 200) {
            await exibirAlertaErro("error", "Erro", data.message)
            return data;
        }

        if (data.valido == true) {
            await exibirAlertaSucesso(data.message);
        } else {
            await exibirAlertaErro("error", "Descrição inválida!", data.message);
        }
        return data;
    } catch (error) {
        //talvez o erro certo seja que a descrição não está dentro dos parâmetros
        await exibirAlertaErro("error", "Erro", "Erro na análise da descrição.")
        return error;
    }
}

async function analisarImagens() {
    let validacaoImagem;

    for (let i = 0; i < contadorImagens; i++) {
        try {
            const formData = new FormData();
            formData.append("imagem", arrayImagens[i]);

            const res = await fetch("noticia/analisar-imagem", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            
            if (data.statusCode != 200) {
                await exibirAlertaErro("error", "Erro", data.message)
                return data;
            }

            if (data.valido == true) {
                await exibirAlertaSucesso(data.message);
            } else {
                await exibirAlertaErro("error", "Imagem inválida!", data.message);
            }

            validacaoImagem = data.valido;
        } catch (error) {
            await exibirAlertaErro("error", "Erro", error.message);
            return error;
        }
    }

    return {
        statusCode: 200,
        valido: validacaoImagem
    };
}

document.getElementById("editarNoticiaForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const loadingContainer = document.querySelector(".loading-container");
  const listaBairros = document.getElementById("listaBairros");
  
  // Caso nenhuma alteração seja feita o usuário é redirecionado
  if ((document.getElementById("imagens").files == imagensNoticiaAntesEdicao) && (listaBairros.value == bairroNoticiaAntesEdicao) && (document.getElementById("descricao").value == descricaoNoticiaAntesEdicao)) {
    window.location.href = "perfil.html";
  } else {
    let bairroValido = await verificarBairro();
    let descricaoValida = await verificarDescricao();
    
    if (bairroValido && descricaoValida) {
        loadingContainer.style.display = "flex";
    
        const resultadoAnalise = await analisarDescricao();
    
        if (resultadoAnalise.statusCode !== 200) {
            await exibirAlertaErro("error", "Erro", resultadoAnalise.message);
            loadingContainer.style.display = "none";
            return;
        }
    
        if (resultadoAnalise.valido == true) {
            let resultadoImagens;
            
            const urlParams = new URLSearchParams(window.location.search);
            const idNoticia = urlParams.get('idNoticia');

            if (contadorImagens > 0) {
                resultadoImagens = await analisarImagens();
    
                if (resultadoImagens.statusCode !== 200) {
                    await exibirAlertaErro("error", "Erro", resultadoImagens.message);
                    loadingContainer.style.display = "none";
                    return;
                }
    
                if (resultadoImagens.valido == true) {
                    const noticia = {
                        ds_noticia: document.getElementById("descricao").value,
                        sg_bairro: listaBairros.value,
                        idNoticia: idNoticia
                    };
    
                    const res = await fetch('/noticia/editar-noticia', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(noticia),
                    });
    
                    // Resultado da edição da notícia
                    const data = await res.json();
    
                    if (data.statusCode === 200) {
                        if (resultadoImagens.statusCode == 200) {
                            // Envia as imagens usando FormData para /upload
                            for (let i = 0; i < arrayImagens.length; i++) {
                                const formData = new FormData();
                                formData.append("imagem", arrayImagens[i]);
                                formData.append("idNoticia", idNoticia);
                                formData.append("apelido", apelido);
                                formData.append("identificador", "Notícia");
    
                                try {
                                    const res = await fetch("/imagem/upload", {
                                        method: "POST",
                                        body: formData
                                    });
    
                                    const resultado = await res.json();
    
                                    if (!res.ok) {
                                        loadingContainer.style.display = "none";
                                        await exibirAlertaErro("error", "Erro", "Uma ou mais imagens não foram enviadas corretamente.");
                                        return;
                                    }
    
                                    await exibirAlertaSucesso(resultado.message);
                                } catch (erro) {
                                    loadingContainer.style.display = "none";
                                    await exibirAlertaErro("error", "Erro", "Erro desconhecido!");
                                    console.error(erro);
                                    return;
                                }
                            }
    
                            await exibirAlertaSucesso(data.message);
                            window.location.href = "perfil.html";
                        }
                    } else {
                        loadingContainer.style.display = "none";
                        await exibirAlertaErro("error", "Erro", "Erro ao editar notícia!");
                        console.log(data.message);
                    }
                } else {
                    loadingContainer.style.display = "none";
                    return;
                }
            } else {
                const noticia = {
                    ds_noticia: document.getElementById("descricao").value,
                    sg_bairro: listaBairros.value,
                    idNoticia: idNoticia
                };
    
                const res = await fetch('/noticia/editar-noticia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(noticia),
                });
    
                // Resultado da edição da notícia
                const data = await res.json();
    
                if (data.statusCode === 200) {
                    await exibirAlertaSucesso(data.message);
                    window.location.href = "perfil.html";
                } else {
                    loadingContainer.style.display = "none";
                    await exibirAlertaErro("error", "Erro", "Erro ao editar notícia!");
                    console.log(data.message);
                }
            }
        } else {
            loadingContainer.style.display = "none";
        }
    }
  }
});

const barraDePesquisa = document.getElementById("barraDePesquisa");

barraDePesquisa.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && barraDePesquisa.value.trim() != "") {
    window.location.href = `resultados-pesquisa.html?busca=${barraDePesquisa.value.trim()}`;
  }
});