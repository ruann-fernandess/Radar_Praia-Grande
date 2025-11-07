import { exibirAlertaErro, exibirAlertaErroERedirecionar, exibirAlertaSucesso } from "./alert.js";
import { exibirModal, esconderModal } from "./modal.js";

let apelido = "";
let apelidoAutor = "";
let idNoticia = "";
let paginaComentarios = 0;
const modalComentarios = document.getElementById("comentariosModal");
const modalAdicionarComentario = document.getElementById("adicionarComentarioModal");
const modalEditarComentario = document.getElementById("editarComentarioModal");
const modalDenunciarNoticia = document.getElementById("denunciarNoticiaModal");
const modalDenunciarComentario = document.getElementById("denunciarComentarioModal");

const partesURL = window.location.pathname.split("/").filter(Boolean);
apelidoAutor = partesURL[1].trim();
idNoticia = partesURL[2].trim();

if (apelidoAutor == "" || idNoticia == "") {
    await exibirAlertaErroERedirecionar("error", "Erro", "Caminho inválido! Não foi possível encontrar a notícia desejada.", "../../index.html");
}

const modalCadastroLogin = document.getElementById("cadastroLoginModal");

document.addEventListener("DOMContentLoaded", () => {
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
            document.querySelector(".navbar .nav-links li:nth-child(1) a").href = "/home.html";
            document.querySelector(".navbar .nav-links li:nth-child(2) a").href = "/perfil.html";
            document.querySelector(".sidebar ul li:nth-child(1) a").href = "/home.html";
            document.querySelector(".sidebar ul li:nth-child(2) a").href = "/perfil.html";
            capturarNoticia(apelidoAutor, idNoticia);
        })
        .catch(async (err) => {
            document.querySelector(".navbar .nav-links li:nth-child(1)").addEventListener("click", function (e) {
                exibirModal(modalCadastroLogin, e);
            });
            document.querySelector(".navbar .nav-links li:nth-child(2)").addEventListener("click", function (e) {
                exibirModal(modalCadastroLogin, e);
            });
            document.querySelector(".navbar .nav-links li:nth-child(3)").style.display = "none";

            document.querySelector(".sidebar ul li:nth-child(1)").addEventListener("click", function (e) {
                exibirModal(modalCadastroLogin, e);
            });
            document.querySelector(".sidebar ul li:nth-child(2)").addEventListener("click", function (e) {
                exibirModal(modalCadastroLogin, e);
            });
            document.querySelector(".sidebar ul li:nth-child(3)").style.display = "none";

            capturarNoticia(apelidoAutor, idNoticia);
        });
});

capturarCategoriasDenuncia();

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
      if (apelido == "") {
        exibirModal(modalCadastroLogin, event);
      } else {
        window.location.href = `/resultados-pesquisa.html?busca=${barra.value.trim()}`;
      }
    }
  });
});

async function capturarNoticia(apelidoAutor, idNoticia) {
    try {
        const res = await fetch('/noticia/capturar-noticia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apelidoAutor, idNoticia }),
        });

        const data = await res.json();

        if (data.noticia == null) {
            await exibirAlertaErroERedirecionar("error", "Caminho inválido!", "Não foi possível encontrar a notícia desejada.", "../../index.html");
        }

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao capturar notícia!");
            throw new Error(data.message || "Erro ao capturar notícia");
        }

        const listaNoticias = document.querySelector(".noticias-lista");
        listaNoticias.innerHTML = "<h2>Notícia</h2>";

        const noticia = data.noticia;
        const noticiaDiv = document.createElement("div");
        noticiaDiv.classList.add("noticia");

        // Legenda (descrição)
        noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: noticia.legenda, style: "margin-bottom: 10px;" }));

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
        }

        // Metadados
        const metadados = document.createElement("div");
        metadados.classList.add("metadados");

        if (noticia.status != "null") {
            if (noticia.status == "Aguardando revisão dos administradores") {
                metadados.appendChild(Object.assign(document.createElement("p"), { textContent: noticia.status, className: "status-noticia pendente" }));
            } else {
                metadados.appendChild(Object.assign(document.createElement("p"), { textContent: noticia.status, className: "status-noticia aprovada" }));
            }
        }

        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Bairro: ${noticia.nomeBairro}` }));

        if (apelido != "") {
            if (noticia.apelido == apelido) {
                metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Autor: ${noticia.apelido}` }));
            } else {
                const autorNoticia = Object.assign(document.createElement("p"), { textContent: "Autor: " });
                const linkPerfilOutroUsuario = Object.assign(document.createElement("a"), { textContent: noticia.apelido });
                linkPerfilOutroUsuario.style.textDecoration = "underline";
                linkPerfilOutroUsuario.href = `/perfil/${noticia.apelido}`;

                autorNoticia.appendChild(linkPerfilOutroUsuario)
                metadados.appendChild(autorNoticia);
            }
        } else {
            const autorNoticia = Object.assign(document.createElement("p"), { textContent: "Autor: " });
            const linkPerfilOutroUsuario = Object.assign(document.createElement("a"), { textContent: noticia.apelido });
            linkPerfilOutroUsuario.style.textDecoration = "underline";
            linkPerfilOutroUsuario.style.cursor = "pointer";

            linkPerfilOutroUsuario.addEventListener("click", function (e) {
                exibirModal(modalCadastroLogin, e);
            });

            autorNoticia.appendChild(linkPerfilOutroUsuario)
            metadados.appendChild(autorNoticia);
        }

        const dataFormatada = formatarDataNoticia(noticia.dataNoticia);
        metadados.appendChild(Object.assign(document.createElement("p"), { textContent: `Data de criação: ${dataFormatada}` }));

        // Curtidas
        const botaoCurtir = document.createElement("button");
        botaoCurtir.classList.add("curtir-btn");

        if (apelido != "") {
            let usuarioCurtiuEstaNoticia = await verificarCurtidaNoticia(noticia.idNoticia, apelido);
            if (usuarioCurtiuEstaNoticia > 0) {
                botaoCurtir.classList.add("active");
                botaoCurtir.textContent = "Remover curtida";
            } else {
                botaoCurtir.textContent = "Curtir";
            }
        } else {
            botaoCurtir.textContent = "Curtir";
            botaoCurtir.addEventListener("click", function (e) {
                exibirModal(modalCadastroLogin, e);
            })
        }

        const curtidas = document.createElement("span");
        const quantidadeCurtidas = document.createElement("b");
        quantidadeCurtidas.textContent = await contarCurtidasNoticia(noticia.idNoticia);

        curtidas.appendChild(quantidadeCurtidas);
        if (quantidadeCurtidas.textContent == 1) {
          curtidas.appendChild(document.createTextNode(" curtida"));
        } else {
          curtidas.appendChild(document.createTextNode(" curtidas"));
        }
        curtidas.appendChild(document.createElement("br"));

        if (apelido != "") {
            botaoCurtir.addEventListener("click", function () {
                curtirOuDescurtirNoticia(noticia.idNoticia, quantidadeCurtidas, botaoCurtir);
            });
        }

        metadados.appendChild(botaoCurtir);
        metadados.appendChild(curtidas);

        // Comentários
        const botaoComentarios = document.createElement("button");
        botaoComentarios.classList.add("exibir-comentarios-btn");
        botaoComentarios.textContent = "Exibir comentários";

        const comentarios = document.createElement("span");
        const quantidadeComentarios = document.createElement("b");
        quantidadeComentarios.textContent = await contarComentariosNoticia(noticia.idNoticia);

        botaoComentarios.addEventListener("click", async (e) => {
            document.getElementById("listaComentarios").innerHTML = "";
            exibirModal(modalComentarios, e);

            if (await contarComentariosNoticia(noticia.idNoticia) == 0) {
                document.getElementById("listaComentarios").innerHTML = "<p style='text-align: center;'>Esta notícia não possui nenhum comentário.</p>";
            } else {
                paginaComentarios = 1;
                await exibirComentariosNoticia(noticia.idNoticia, quantidadeComentarios);
            }

            document.getElementById("adicionarComentario").onclick = () => {
                exibirModal(modalAdicionarComentario, e);
            };

            document.getElementById("confirmarComentario").onclick = async (e) => {
                if (apelido != "") {
                    let comentario = document.getElementById("descricaoComentario");
                    if (comentario.value.trim().length > 0) {
                        document.getElementById("confirmarComentario").disabled = true;
                        document.getElementById("descricaoComentario").disabled = true;

                        await comentarNoticia(comentario.value.trim(), noticia.idNoticia);

                        document.getElementById("listaComentarios").innerHTML = "";
                        paginaComentarios = 1;
                        await exibirComentariosNoticia(noticia.idNoticia, quantidadeComentarios);

                        esconderModal(modalAdicionarComentario);
                        document.getElementById("confirmarComentario").disabled = false;
                        document.getElementById("descricaoComentario").disabled = false;
                        comentario.value = "";
                        quantidadeComentarios.textContent = await contarComentariosNoticia(noticia.idNoticia);
                    }   
                } else {
                    exibirModal(modalCadastroLogin, e);
                }
            }
        });

        comentarios.appendChild(quantidadeComentarios);
        if (quantidadeComentarios.textContent == 1) {
          comentarios.appendChild(document.createTextNode(" comentário"));
        } else {
          comentarios.appendChild(document.createTextNode(" comentários"));
        }
        comentarios.appendChild(document.createElement("br"));

        metadados.appendChild(botaoComentarios);
        metadados.appendChild(comentarios);

        if (apelido != "") {
            if (noticia.apelido == apelido) {
                // Link editar
                const linkEditar = document.createElement("a");
                linkEditar.classList.add("editar-noticia");
                linkEditar.href = `/editar-noticia.html?idNoticia=${encodeURIComponent(noticia.idNoticia)}`;
                linkEditar.textContent = "Editar notícia";
                metadados.appendChild(linkEditar);
            } else {
                let usuarioDenunciouEstaNoticia = await verificarDenunciaNoticia(noticia.idNoticia, apelido);
                if (usuarioDenunciouEstaNoticia == 0) {
                    // Denúncias
                    const botaoDenunciar = document.createElement("button");
                    botaoDenunciar.classList.add("denunciar-btn", "denunciar-noticia");
                    botaoDenunciar.dataset.idNoticia = noticia.idNoticia;
                    botaoDenunciar.textContent = "Denunciar";

                    botaoDenunciar.onclick = (e) => {
                        // guarda o id da notícia selecionada no botão confirmar
                        document.getElementById("confirmarDenunciaNoticia").dataset.idNoticia = noticia.idNoticia;
                        document.getElementById("descricaoDenunciaNoticia").value = "";
                        exibirModal(modalDenunciarNoticia, e);
                    };

                    metadados.appendChild(botaoDenunciar);
                }
            }
        } else {
            // Denúncias
            const botaoDenunciar = document.createElement("button");
            botaoDenunciar.classList.add("denunciar-btn", "denunciar-noticia");
            botaoDenunciar.textContent = "Denunciar";

            botaoDenunciar.onclick = (e) => {
                document.getElementById("confirmarDenunciaNoticia").dataset.idNoticia = noticia.idNoticia;
                document.getElementById("descricaoDenunciaNoticia").value = "";
                exibirModal(modalDenunciarNoticia, e);
            };

            metadados.appendChild(botaoDenunciar);
        }

        noticiaDiv.appendChild(metadados);
        listaNoticias.appendChild(noticiaDiv);

        console.log(`(${data.statusCode}) ${data.message}`);

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao capturar notícia!");
        console.error('Erro na requisição: ' + error.message);
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

    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${ano}, ${horaStr}:${minuto}`;
}

async function verificarCurtidaNoticia(idNoticia, apelido) {
    try {
        const res = await fetch('/noticia/verifica-curtida-noticia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idNoticia, apelido }),
        });

        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida de notícia!");
            throw new Error(data.message || "Erro ao verificar curtida de notícia");
        }

        return data.existeCurtidaNoticia;

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida da notícia!");
        console.error('Erro na requisição: ' + error.message);
    }
}

async function contarCurtidasNoticia(idNoticia) {
    try {
        const res = await fetch('/noticia/contar-curtidas-noticia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idNoticia }),
        });

        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas da notícia!");
            throw new Error(data.message || "Erro ao contar curtidas da notícia");
        }

        return data.quantidadeCurtidasNoticia;

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas da notícia!");
        console.error('Erro na requisição: ' + error.message);
    }
}

async function contarComentariosNoticia(idNoticia) {
    try {
        const res = await fetch('/noticia/contar-comentarios-noticia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idNoticia }),
        });

        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao contar comentários da notícia!");
            throw new Error(data.message || "Erro ao contar comentários da notícia");
        }

        return data.quantidadeComentariosNoticia;

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao contar comentários da notícia!");
        console.error('Erro na requisição: ' + error.message);
    }
}

async function verificarDenunciaNoticia(idNoticia, apelido) {
    try {
        const res = await fetch('/denuncia/verifica-denuncia-noticia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idNoticia, apelido }),
        });

        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao verificar denúncia da notícia!");
            throw new Error(data.message || "Erro ao verificar denúncia da notícia");
        }

        return data.existeDenunciaNoticia;

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao verificar denúncia da notícia!");
        console.error('Erro na requisição: ' + error.message);
    }
}

document.getElementById("confirmarDenunciaNoticia").onclick = async (e) => {
    if (apelido != "") {
        let idNoticia = document.getElementById("confirmarDenunciaNoticia").dataset.idNoticia;
        let categoriaDenunciaSelecionada = document.querySelector("#denunciarNoticiaModal .listaCategoriaDenuncia");
        let denuncia = document.getElementById("descricaoDenunciaNoticia");

        if (denuncia.value.trim().length > 0 && await verificarCategoriaDenuncia(categoriaDenunciaSelecionada.value)) {
            document.getElementById("confirmarDenunciaNoticia").disabled = true;
            document.getElementById("descricaoDenunciaNoticia").disabled = true;

            await denunciarNoticia(categoriaDenunciaSelecionada.value, denuncia.value.trim(), idNoticia);
            document.querySelector(`.denunciar-noticia[data-id-noticia="${idNoticia}"]`).remove();
            
            esconderModal(modalDenunciarNoticia);
            categoriaDenunciaSelecionada.value = "";
            denuncia.value = "";
            document.getElementById("confirmarDenunciaNoticia").disabled = false;
            document.getElementById("descricaoDenunciaNoticia").disabled = false;
        }
    } else {
        exibirModal(modalCadastroLogin, e);
    }
}

document.getElementById("confirmarDenunciaComentario").onclick = async (e) => {
    if (apelido != "") {
        let idComentario = document.getElementById("confirmarDenunciaComentario").dataset.idComentario;
        let categoriaDenunciaSelecionada = document.querySelector("#denunciarComentarioModal .listaCategoriaDenuncia");
        let denuncia = document.getElementById("descricaoDenunciaComentario");

        if (denuncia.value.trim().length > 0 && await verificarCategoriaDenuncia(categoriaDenunciaSelecionada.value)) {
            document.getElementById("confirmarDenunciaComentario").disabled = true;
            document.getElementById("descricaoDenunciaComentario").disabled = true;

            await denunciarComentario(categoriaDenunciaSelecionada.value, denuncia.value.trim(), idComentario);
            document.querySelector(`.denunciar-comentario[data-id-comentario="${idComentario}"]`).remove();
                    
            await capturarNoticia(apelidoAutor, idNoticia);
            esconderModal(modalDenunciarComentario);
            esconderModal(modalComentarios);
            categoriaDenunciaSelecionada.value = "";
            denuncia.value = "";
            document.getElementById("confirmarDenunciaComentario").disabled = false;
            document.getElementById("descricaoDenunciaComentario").disabled = false;
        }
    } else {
        exibirModal(modalCadastroLogin, e);
    }
}

async function exibirComentariosNoticia(idNoticia, quantidadeComentarios) {
  const comentariosNoticia = await capturarComentariosNoticia(idNoticia, paginaComentarios);
  
  for (let i = 0; i < comentariosNoticia.comentarios.length; i++) {
    const comentarioNoticia = comentariosNoticia.comentarios[i];

    const comentario = document.createElement("div");
    comentario.classList.add("comentario");

    const comentarioCabecalho = document.createElement("header");
            
    const ladoEsquerdoCabecalho = document.createElement("div");
    ladoEsquerdoCabecalho.classList.add("lado-esquerdo");
    const ladoDireitoCabecalho = document.createElement("div");
    ladoDireitoCabecalho.classList.add("lado-direito");

    const fotoAutorComentario = document.createElement("img");
    fotoAutorComentario.src = comentarioNoticia.fotoPerfil;

    ladoEsquerdoCabecalho.appendChild(fotoAutorComentario);
    comentarioCabecalho.appendChild(ladoEsquerdoCabecalho);

    if (comentarioNoticia.apelido == apelido) {
      const apelidoAutorComentario = document.createElement("p");
      apelidoAutorComentario.textContent = comentarioNoticia.apelido;
      ladoDireitoCabecalho.appendChild(apelidoAutorComentario)
    } else {
      const apelidoAutorComentario = document.createElement("a");
      apelidoAutorComentario.textContent = comentarioNoticia.apelido;
      apelidoAutorComentario.style.textDecoration = "underline";
      apelidoAutorComentario.href = `/perfil/${comentarioNoticia.apelido}`;

      ladoDireitoCabecalho.appendChild(apelidoAutorComentario)
    }

    const dataComentario = document.createElement("p");
    dataComentario.textContent = "Data publicação: " + formatarDataNoticia(comentarioNoticia.dataComentario);
    ladoDireitoCabecalho.appendChild(dataComentario);
    comentarioCabecalho.appendChild(ladoDireitoCabecalho);

    const comentarioMain = document.createElement("main");
    const textoComentario = document.createElement("p");
    textoComentario.textContent = comentarioNoticia.comentario;
    comentarioMain.appendChild(textoComentario);

    const comentarioRodape = document.createElement("footer");
    const botaoCurtirComentario = document.createElement("button");
    botaoCurtirComentario.classList.add("curtir-btn");

    const curtidasComentario = document.createElement("span");
    const quantidadeCurtidasComentario = document.createElement("b");
    quantidadeCurtidasComentario.textContent = await contarCurtidasComentarioNoticia(comentarioNoticia.idComentario);

    curtidasComentario.appendChild(quantidadeCurtidasComentario);
    if (quantidadeCurtidasComentario.textContent == 1) {
      curtidasComentario.appendChild(document.createTextNode(" curtida"));
    } else {
      curtidasComentario.appendChild(document.createTextNode(" curtidas"));
    }
    curtidasComentario.appendChild(document.createElement("br"));

    if (apelido != "") {
        let usuarioCurtiuEsteComentario = await verificarCurtidaComentarioNoticia(comentarioNoticia.idComentario, apelido);
        if (usuarioCurtiuEsteComentario > 0) {
            botaoCurtirComentario.classList.add("active");
            botaoCurtirComentario.textContent = "Remover curtida";
        } else {
            botaoCurtirComentario.textContent = "Curtir";
        }

        botaoCurtirComentario.addEventListener("click", function() {
            curtirOuDescurtirComentarioNoticia(comentarioNoticia.idComentario, quantidadeCurtidasComentario, botaoCurtirComentario);
        });
    } else {
        botaoCurtirComentario.textContent = "Curtir";
        botaoCurtirComentario.addEventListener("click", function (e) {
            exibirModal(modalCadastroLogin, e);
        })
    }

    comentarioRodape.appendChild(botaoCurtirComentario);
    comentarioRodape.appendChild(curtidasComentario);

    if (apelido != "") {
        if (comentarioNoticia.apelido == apelido) {
            // Link editar
            const linkEditarComentario = document.createElement("a");
            linkEditarComentario.classList.add("editar-comentario");
            linkEditarComentario.textContent = "Editar comentário";

            linkEditarComentario.onclick = (e) => {
                // guarda o id do comentário selecionado no botão confirmar
                document.getElementById("confirmarExcluirComentario").dataset.idComentario = comentarioNoticia.idComentario;

                document.getElementById("descricaoEditarComentario").value = textoComentario.textContent;
                exibirModal(modalEditarComentario, e);
            };

            document.getElementById("confirmarEditarComentario").onclick = async () => {
                const idComentarioAtual = document.getElementById("confirmarExcluirComentario").dataset.idComentario;
                let comentarioEditado = document.getElementById("descricaoEditarComentario").value.trim();
                
                if (comentarioEditado.length > 0) {
                document.getElementById("confirmarExcluirComentario").disabled = true;
                document.getElementById("confirmarEditarComentario").disabled = true;
                document.getElementById("descricaoEditarComentario").disabled = true;

                await editarComentarioNoticia(comentarioEditado, idComentarioAtual);

                document.getElementById("listaComentarios").innerHTML = "";
                paginaComentarios = 1;
                await exibirComentariosNoticia(idNoticia, quantidadeComentarios);

                esconderModal(modalEditarComentario);
                document.getElementById("confirmarExcluirComentario").disabled = false;
                document.getElementById("confirmarEditarComentario").disabled = false;
                document.getElementById("descricaoEditarComentario").disabled = false;

                document.getElementById("descricaoEditarComentario").value = "";
                textoComentario.textContent = comentarioEditado;
                }
            }

            document.getElementById("confirmarExcluirComentario").onclick = async () => {
                const idComentarioAtual = document.getElementById("confirmarExcluirComentario").dataset.idComentario;
                document.getElementById("confirmarExcluirComentario").disabled = true;
                document.getElementById("confirmarEditarComentario").disabled = true;
                document.getElementById("descricaoEditarComentario").disabled = true;

                await apagarComentarioNoticia(idComentarioAtual);

                if (await contarComentariosNoticia(idNoticia) == 0) {
                document.getElementById("listaComentarios").innerHTML = "<p style='text-align: center;'>Esta notícia não possui nenhum comentário.</p>";
                } else {
                document.getElementById("listaComentarios").innerHTML = "";
                paginaComentarios = 1;
                await exibirComentariosNoticia(idNoticia, quantidadeComentarios);
                }
                
                esconderModal(modalEditarComentario);
                document.getElementById("confirmarExcluirComentario").disabled = false;
                document.getElementById("confirmarEditarComentario").disabled = false;
                document.getElementById("descricaoEditarComentario").disabled = false;

                document.getElementById("descricaoEditarComentario").value = "";
                quantidadeComentarios.textContent = await contarComentariosNoticia(idNoticia);
            }
            comentarioRodape.appendChild(linkEditarComentario);
        } else {
            let usuarioDenunciouEsteComentario = await verificarDenunciaComentario(comentarioNoticia.idComentario, apelido);
            if (usuarioDenunciouEsteComentario == 0) {
                // Denúncias
                const botaoDenunciarComentario = document.createElement("button");
                botaoDenunciarComentario.classList.add("denunciar-btn", "denunciar-comentario");
                botaoDenunciarComentario.dataset.idComentario = comentarioNoticia.idComentario;
                botaoDenunciarComentario.textContent = "Denunciar";

                botaoDenunciarComentario.onclick = (e) => {
                // guarda o id do comentário selecionado no botão confirmar
                    document.getElementById("confirmarDenunciaComentario").dataset.idComentario = comentarioNoticia.idComentario;
                    document.getElementById("descricaoDenunciaComentario").value = "";
                    exibirModal(modalDenunciarComentario, e);
                };

                comentarioRodape.appendChild(botaoDenunciarComentario);
            }
        }
    } else {
        // Denúncias
        const botaoDenunciarComentario = document.createElement("button");
        botaoDenunciarComentario.classList.add("denunciar-btn", "denunciar-comentario");
        botaoDenunciarComentario.dataset.idComentario = comentarioNoticia.idComentario;
        botaoDenunciarComentario.textContent = "Denunciar";

        botaoDenunciarComentario.onclick = (e) => {
            exibirModal(modalDenunciarComentario, e);
        };

        comentarioRodape.appendChild(botaoDenunciarComentario);
    }

    comentario.appendChild(comentarioCabecalho);
    comentario.appendChild(comentarioMain);
    comentario.appendChild(comentarioRodape);

    // Se for o último elemento da página
    if (i === comentariosNoticia.comentarios.length - 1) {
      const observer = new IntersectionObserver((entries, observerRef) => {
        entries.forEach(async entry => {
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            observerRef.unobserve(entry.target);

            // verifica se ainda há comentários para carregar
            const totalComentarios = parseInt(quantidadeComentarios.textContent, 10); // Total geral
            const comentariosAtuais = comentariosNoticia.comentarios.length; // Comentários na página atual

            if ((paginaComentarios * comentariosAtuais) < totalComentarios) {
              paginaComentarios++;
              await exibirComentariosNoticia(idNoticia, quantidadeComentarios);
            }
          }
        });
      }, {
        threshold: 1.0 // Só dispara quando 100% visível
      });

      observer.observe(comentario);
    }

    document.getElementById("listaComentarios").appendChild(comentario);
  }
}

async function capturarComentariosNoticia(idNoticia, paginaComentarios = 1) {
  try {
    const res = await fetch(
      `/noticia/capturar-comentarios-noticia/${encodeURIComponent(idNoticia)}/${encodeURIComponent(paginaComentarios)}`
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      await exibirAlertaErro("error", "Erro", "Erro ao buscar comentários da notícia!");
      throw new Error(errorData.message || "Erro ao buscar comentários da notícia");
    }

    const data = await res.json();

    return {
      comentarios: data.comentarios,
      totalComentarios: data.totalComentarios
    };
  } catch (error) {
    console.error(error);
    await exibirAlertaErro("error", "Erro", error.message);
    return { comentarios: [], totalComentarios: 0 };
  }
}

async function verificarCurtidaComentarioNoticia(idComentario, apelido) {
  try {
    const res = await fetch('/noticia/verifica-curtida-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida do comentário da notícia!");
      throw new Error(data.message || "Erro ao verificar curtida do comentário da notícia");
    }

    return data.existeCurtidaComentarioNoticia;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao verificar curtida do comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function contarCurtidasComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/contar-curtidas-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas do comentário da notícia!");
      throw new Error(data.message || "Erro ao contar curtidas do comentário da notícia");
    }

    return data.quantidadeCurtidasComentarioNoticia;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao contar curtidas do comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function verificarDenunciaComentario(idComentario, apelido) {
  try {
    const res = await fetch('/denuncia/verifica-denuncia-comentario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao verificar denúncia de comentário!");
      throw new Error(data.message || "Erro ao verificar denúncia de comentário");
    }

    return data.existeDenunciaComentario;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao verificar denúncia de comentário!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function curtirOuDescurtirComentarioNoticia(idComentario, quantidadeCurtidasComentario, botaoCurtirComentario) {
  let usuarioCurtiuEsteComentario = await verificarCurtidaComentarioNoticia(idComentario, apelido);

  if (usuarioCurtiuEsteComentario > 0) {
    const resultado = await removerCurtidaComentarioNoticia(idComentario);

    if (resultado.statusCode == 200) {
      if (botaoCurtirComentario.classList.contains("active")) {
        botaoCurtirComentario.classList.remove("active");
      }

      botaoCurtirComentario.textContent = "Curtir";
      quantidadeCurtidasComentario.textContent = parseInt(quantidadeCurtidasComentario.textContent) - 1;
      if (quantidadeCurtidasComentario.textContent == 1) {
        quantidadeCurtidasComentario.parentNode.childNodes[1].textContent = " curtida";   
      } else {
        quantidadeCurtidasComentario.parentNode.childNodes[1].textContent = " curtidas";
      }
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  } else {
    const resultado = await curtirComentarioNoticia(idComentario);

    if (resultado.statusCode == 200) {
      if (!botaoCurtirComentario.classList.contains("active")) {
        botaoCurtirComentario.classList.add("active");
      }

      botaoCurtirComentario.textContent = "Remover curtida";
      quantidadeCurtidasComentario.textContent = parseInt(quantidadeCurtidasComentario.textContent) + 1;
      if (quantidadeCurtidasComentario.textContent == 1) {
        quantidadeCurtidasComentario.parentNode.childNodes[1].textContent = " curtida";   
      } else {
        quantidadeCurtidasComentario.parentNode.childNodes[1].textContent = " curtidas";
      }
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  }
}

async function curtirOuDescurtirNoticia(idNoticia, quantidadeCurtidas, botaoCurtir) {
  let usuarioCurtiuEstaNoticia = await verificarCurtidaNoticia(idNoticia, apelido);

  if (usuarioCurtiuEstaNoticia > 0) {
    const resultado = await removerCurtidaNoticia(idNoticia);

    if (resultado.statusCode == 200) {
      if (botaoCurtir.classList.contains("active")) {
        botaoCurtir.classList.remove("active");
      }

      botaoCurtir.textContent = "Curtir";
      quantidadeCurtidas.textContent = parseInt(quantidadeCurtidas.textContent) - 1;
      if (quantidadeCurtidas.textContent == 1) {
        quantidadeCurtidas.parentNode.childNodes[1].textContent = " curtida";   
      } else {
        quantidadeCurtidas.parentNode.childNodes[1].textContent = " curtidas";
      }
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  } else {
    const resultado = await curtirNoticia(idNoticia);

    if (resultado.statusCode == 200) {
      if (!botaoCurtir.classList.contains("active")) {
        botaoCurtir.classList.add("active");
      }

      botaoCurtir.textContent = "Remover curtida";
      quantidadeCurtidas.textContent = parseInt(quantidadeCurtidas.textContent) + 1;
      if (quantidadeCurtidas.textContent == 1) {
        quantidadeCurtidas.parentNode.childNodes[1].textContent = " curtida";   
      } else {
        quantidadeCurtidas.parentNode.childNodes[1].textContent = " curtidas";
      }
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
    }
  }
}

async function curtirNoticia(idNoticia) {
  try {
    const res = await fetch('/noticia/curtir-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao curtir notícia!");
      throw new Error(data.message || "Erro ao curtir notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao curtir notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function removerCurtidaNoticia(idNoticia) {
  try {
    const res = await fetch('/noticia/remover-curtida-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao remover curtida da notícia!");
      throw new Error(data.message || "Erro ao remover curtida da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao remover curtida da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function editarComentarioNoticia(comentarioEditado, idComentario) {
  try {
    const res = await fetch('/noticia/editar-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentarioEditado, idComentario }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao editar comentário da notícia!");
      throw new Error(data.message || "Erro ao editar comentário da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao editar comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function apagarComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/apagar-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao apagar comentário da notícia!");
      throw new Error(data.message || "Erro ao apagar comentário da notícia");
    }

    return data;
  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao apagar comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function comentarNoticia(comentario, idNoticia) {
  try {
    const res = await fetch('/noticia/comentar-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comentario, idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao comentar notícia!");
      throw new Error(data.message || "Erro ao comentar notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao comentar notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function curtirComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/curtir-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao curtir comentário da notícia!");
      throw new Error(data.message || "Erro ao curtir comentário da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao curtir comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function removerCurtidaComentarioNoticia(idComentario) {
  try {
    const res = await fetch('/noticia/remover-curtida-comentario-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao remover curtida do comentário da notícia!");
      throw new Error(data.message || "Erro ao remover curtida do comentário da notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao remover curtida do comentário da notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

// Adicionando as categorias de denúncia disponíveis num array
let arrayCategoriasDenuncia = [];
async function capturarCategoriasDenuncia() {
    try {
        const res = await fetch("/denuncia/capturar-categorias-denuncia");
        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao buscar categorias de denúncia!");
            throw new Error(errorData.message || "Erro ao buscar categorias de denúncia"); 
        }

        const data = await res.json();
        const listasCategoriasDenuncia = document.querySelectorAll(".listaCategoriaDenuncia");

        for (let i = 0; i < listasCategoriasDenuncia.length; i++) {
          for (let j = 0; j < data.categoriasDenuncia.length; j++) {
            let opcaoCategoriaDenuncia = document.createElement("option");
            opcaoCategoriaDenuncia.value = data.categoriasDenuncia[j].idCategoriaDenuncia;
            opcaoCategoriaDenuncia.textContent = data.categoriasDenuncia[j].categoria;

            listasCategoriasDenuncia[i].appendChild(opcaoCategoriaDenuncia);
            if (i == 0) {
              arrayCategoriasDenuncia.push(data.categoriasDenuncia[j].idCategoriaDenuncia);
            }
          }
        }
    } catch (error) {
        await exibirAlertaErro("error", "Erro", error.message);
    }
}

// Valida o bairro selecionado
async function verificarCategoriaDenuncia(categoriaDenunciaSelecionada) {
  if (categoriaDenunciaSelecionada == "") {
    await exibirAlertaErro("warning", "Atenção", "Declare a categoria da denúncia.");
    return false;
  } else {
    if (arrayCategoriasDenuncia.indexOf(Number(categoriaDenunciaSelecionada)) >= 0) {
      return true;
    } else {
      await exibirAlertaErro("warning", "Atenção", "Declare uma categoria de denúncia válida.");
      return false;
    }
  }
}

async function denunciarNoticia(categoriaDenunciaSelecionada, denuncia, idNoticia) {
  try {
    const res = await fetch('/denuncia/denunciar-noticia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoriaDenunciaSelecionada, denuncia, idNoticia, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao denunciar notícia!");
      throw new Error(data.message || "Erro ao denunciar notícia");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao denunciar notícia!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function denunciarComentario(categoriaDenunciaSelecionada, denuncia, idComentario) {
  try {
    const res = await fetch('/denuncia/denunciar-comentario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoriaDenunciaSelecionada, denuncia, idComentario, apelido }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao denunciar comentário!");
      throw new Error(data.message || "Erro ao denunciar comentário");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao denunciar comentário!");
    console.error('Erro na requisição: ' + error.message);
  }
}