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

// Input de bairros e seus avisos
const inputBairro = document.getElementById("bairro");

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

// Adicionando os bairros disponíveis num array
let arrayBairros = [];
const optionsListaBairros = document.querySelectorAll("datalist#listaBairros option");
for (let i = 0; i < optionsListaBairros.length; i++) {
    arrayBairros.push(optionsListaBairros[i].value);
}

// Valida o bairro selecionado
function verificarBairro() {
    let bairroSelecionado = inputBairro.value.trim();

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
function verificarDescricao() {
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
        const res = await fetch("noticia/analisarDescricao", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descricao }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw errorData;
        }

        const data = await res.json();
        alert(`(${data.statusCode}) ${data.message}`);
    } catch (error) {
        alert(`(${error.statusCode}) ${error.message}`);
    }
}

async function analisarImagens() {
    for (let i = 0; i < contadorImagens; i++) {
        try {
            const formData = new FormData();
            formData.append("imagem", arrayImagens[i]);

            const res = await fetch("noticia/analisarImagem", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json(); 
                throw errorData; 
            }

            const data = await res.json();
            alert(`(${data.statusCode}) ${data.message}`);
        } catch (error) {
            alert(`(${error.statusCode}) ${error.message}`);
        }
    }
}

document.getElementById("cadastronoticiaForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    let bairroValido = verificarBairro();
    let descricaoValida = verificarDescricao();

    if (bairroValido && descricaoValida) {
        analisarDescricao();

        let noticia;

        if (contadorImagens > 0) {
            analisarImagens();

            noticia = {
                imagens: document.getElementById("imagens").files,
                sg_bairro: document.getElementById("bairro").value,
                ds_noticia: document.getElementById("descricao").value
            };
        } else {
            noticia = {
                sg_bairro: document.getElementById("bairro").value,
                ds_noticia: document.getElementById("descricao").value
            };
        }
    }
});