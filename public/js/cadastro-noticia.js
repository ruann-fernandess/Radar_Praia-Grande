import { exibirAlertaErro, exibirAlertaSucesso, exibirAlertaErroERedirecionar } from "./alert.js";

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
  })
  .catch(async (err) => {
    console.error(err.message);
    await exibirAlertaErroERedirecionar("error", "Erro", err.message, "/login.html");
  });

// Adicionando os bairros disponíveis num array
let arrayBairros = [];

async function capturarBairros() {
    try {
        const res = await fetch("noticia/capturar-bairros");
        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao buscar bairros!");
            throw new Error(errorData.message || "Erro ao buscar bairros"); 
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
    } catch (error) {
        await exibirAlertaErro("error", "Erro", error.message);
    }
}

const inputImagens = document.getElementById("imagens");
const listaImagens = document.getElementById("listaImagens");
const exemploItemImagem = document.getElementById("exemploItemImagem");
let arrayImagens = [];
let contadorImagens = 0;
const arrayTiposArquivosAceitos = ["image/jpg", "image/jpeg", "image/png"];

inputImagens.addEventListener("change", async function () {
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
                        await exibirAlertaErro("warning", "Atenção", "O arquivo " + nomeArquivoAtual + " não possui um formato suportado.")
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
        
    await exibirAlertaErro("warning", "Atenção", "Declare o bairro.");

        return false;
    } else {
        if (arrayBairros.indexOf(bairroSelecionado) >= 0) {
            return true;
        } else {
            await exibirAlertaErro("warning", "Atenção", "Declare um bairro válido.");
            return false;
        }
    }
}

// Valida o texto da notícia
async function verificarDescricao() {
    let descricao = textareaDescricao.value.trim();

    if (descricao == "") {
        await exibirAlertaErro("warning", "Atenção", "Adicione uma descrição.");

        return false;
    } else if (descricao.length < 4) {
        await exibirAlertaErro("warning", "Atenção", "A descrição deve ter ao menos 5 caracteres.");

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

            console.log(JSON.stringify(data));
            
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
        await exibirAlertaErro("error", "Erro", resultadoAnalise.message);
        loadingContainer.style.display = "none";
        return;
    }

    if (resultadoAnalise.valido == true) {
        let resultadoImagens;

        if (contadorImagens > 0) {
            resultadoImagens = await analisarImagens();

            if (resultadoImagens.statusCode !== 200) {
                await exibirAlertaErro("error", "Erro", resultadoImagens.message);
                loadingContainer.style.display = "none";
                return;
            }

            if (resultadoImagens.valido == true) {
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

                // Resultado do cadastro da notícia
                const data = await response.json();

                if (data.statusCode === 200) {
                    if (resultadoImagens.statusCode == 200) {
                        // Envia as imagens usando FormData para /upload
                        for (let i = 0; i < arrayImagens.length; i++) {
                            const formData = new FormData();
                            formData.append("imagem", arrayImagens[i]);
                            formData.append("idNoticia", data.idNoticia);
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
                        window.location.href = "/perfil.html";
                    }
                } else {
                    loadingContainer.style.display = "none";
                    await exibirAlertaErro("error", "Erro", "Erro ao cadastrar notícia!");
                    console.log(data.message);
                }
            } else {
                loadingContainer.style.display = "none";
                return;
            }
        } else {
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

            // Resultado do cadastro da notícia
            const data = await response.json();

            if (data.statusCode === 200) {
                await exibirAlertaSucesso(data.message);
                window.location.href = "/perfil.html";
            } else {
                loadingContainer.style.display = "none";
                await exibirAlertaErro("error", "Erro", "Erro ao cadastrar notícia!");
                console.log(data.message);
            }
        }
    } else {
        loadingContainer.style.display = "none";
    }
  }
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
