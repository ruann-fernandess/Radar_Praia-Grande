import { exibirAlertaErro, exibirAlertaErroERedirecionar, exibirAlertaSucesso } from "./alert.js";
import { exibirModal, esconderModal } from "./modal.js";

let apelido = "";
let paginaDenunciasNoticia = 0;
let paginaComentarios = 0;
let paginaDenunciasComentario = 0;
const modalComentarios = document.getElementById("comentariosModal");
const modalNoticia = document.getElementById("noticiaModal");
const modalDenunciasComentario = document.getElementById("denunciasComentarioModal");
const modalExcluirComentario = document.getElementById("excluirComentarioModal");
const modalDesativarNoticia = document.getElementById("desativarNoticiaModal");
const modalAtivarNoticia = document.getElementById("ativarNoticiaModal");
const cancelarDesativarNoticia = document.getElementById("cancelarDesativarNoticia");
const cancelarAtivarNoticia = document.getElementById("cancelarAtivarNoticia");
cancelarDesativarNoticia.addEventListener("click", () => {
    esconderModal(modalDesativarNoticia);
});
cancelarAtivarNoticia.addEventListener("click", () => {
    esconderModal(modalAtivarNoticia);
});

const cancelarExcluirComentario = document.getElementById("cancelarExcluirComentario");
cancelarExcluirComentario.addEventListener("click", () => {
    esconderModal(modalExcluirComentario);
});

const barraDePesquisa = document.getElementById("barraDePesquisa");
let ultimaTecla = "";
barraDePesquisa.addEventListener("keydown", (event) => {
    ultimaTecla = event.key;
});

barraDePesquisa.addEventListener("input", (event) => {
    const busca = event.target.value.trim();

    if (busca !== "") {
        pesquisarComentariosAdmin(busca, 1);
    } else if (ultimaTecla === "Backspace") {
        capturarComentariosAdmin(1);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetch("/admin/perfil")
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
            // Se não for admin, redireciona para a página inicial
            if (data.admin === 0) {
                window.location.href = "/index.html";
                return;
            }

            apelido = data.apelido;
            capturarComentariosAdmin(1);

            document.getElementById("confirmarExcluirComentario").addEventListener("click", async function () {
                let idComentario = document.getElementById("confirmarExcluirComentario").dataset.idComentario;

                await apagarComentarioNoticia(idComentario);

                await capturarComentariosAdmin(1);
                esconderModal(modalExcluirComentario);
            });

            document.getElementById("confirmarDesativarNoticia").addEventListener("click", async function () {
                let idNoticia = document.getElementById("confirmarDesativarNoticia").dataset.idNoticia;
                try {
                    const resposta = await fetch("/admin/desativar-noticia", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ idNoticia })
                    });

                    const resultado = await resposta.json();
                    await capturarNoticiaAdmin(idNoticia);
                    esconderModal(modalDesativarNoticia);
                } catch (erro) {
                    await exibirAlertaErro("error", "Erro", "Erro ao tentar desativar notícia!");
                    console.error(erro);
                }
            });

            document.getElementById("confirmarAtivarNoticia").addEventListener("click", async function () {
                let idNoticia = document.getElementById("confirmarAtivarNoticia").dataset.idNoticia;
                try {
                    const resposta = await fetch("/admin/ativar-noticia", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ idNoticia })
                    });

                    const resultado = await resposta.json();
                    await capturarNoticiaAdmin(idNoticia);
                    esconderModal(modalAtivarNoticia);
                } catch (erro) {
                    await exibirAlertaErro("error", "Erro", "Erro ao tentar ativar notícia!");
                    console.error(erro);
                }
            });
        })
        .catch(async (err) => {
            console.error(err.message);
            await exibirAlertaErroERedirecionar("error", "Erro", err.message, "/admin/login.html");
        });
});

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

async function capturarComentariosAdmin(pagina = 1) {
    try {
        const res = await fetch(`/admin/capturar-comentarios?pagina=${pagina}`);
        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao capturar comentários!");
            throw new Error(data.message || "Erro ao capturar comentários");
        }

        const listaComentarios = document.getElementById("listaComentarios");
        const paginacaoComentarios = document.getElementById("paginacaoComentarios");

        // Se não tiver nenhum comentário cadastrado
        if (!data.comentarios || data.comentarios.length === 0) {
            listaComentarios.style.textAlign = "center";
            listaComentarios.innerHTML = "Nenhum comentário foi encontrado.";

            if (listaComentarios.classList.contains("active")) {
                listaComentarios.classList.remove("active");
            }
            paginacaoComentarios.innerHTML = "";
        } else {
            listaComentarios.style.textAlign = "left";
            listaComentarios.innerHTML = "";
            paginacaoComentarios.innerHTML = "";
            if (!listaComentarios.classList.contains("active")) {
                listaComentarios.classList.add("active");
            }

            // Percorre as notícias
            for (const comentario of data.comentarios) {
                const comentarioDiv = document.createElement("div");
                comentarioDiv.classList.add("comentario");

                const comentarioCabecalho = document.createElement("header");

                const ladoEsquerdoCabecalho = document.createElement("div");
                ladoEsquerdoCabecalho.classList.add("lado-esquerdo");
                const ladoDireitoCabecalho = document.createElement("div");
                ladoDireitoCabecalho.classList.add("lado-direito");

                const fotoAutorComentario = document.createElement("img");
                fotoAutorComentario.src = comentario.fotoPerfil;

                ladoEsquerdoCabecalho.appendChild(fotoAutorComentario);
                comentarioCabecalho.appendChild(ladoEsquerdoCabecalho);

                const apelidoAutorComentario = document.createElement("p");
                apelidoAutorComentario.textContent = comentario.apelido;
                ladoDireitoCabecalho.appendChild(apelidoAutorComentario)

                const dataComentario = document.createElement("p");
                dataComentario.textContent = "Data publicação: " + formatarData(comentario.dataComentario);
                ladoDireitoCabecalho.appendChild(dataComentario);
                comentarioCabecalho.appendChild(ladoDireitoCabecalho);

                const comentarioMain = document.createElement("main");
                const textoComentario = document.createElement("p");
                textoComentario.textContent = comentario.comentario;
                comentarioMain.appendChild(textoComentario);

                const comentarioRodape = document.createElement("footer");
                const curtidasComentario = document.createElement("span");
                const quantidadeCurtidasComentario = document.createElement("b");
                quantidadeCurtidasComentario.textContent = await contarCurtidasComentarioNoticia(comentario.idComentario);

                curtidasComentario.appendChild(quantidadeCurtidasComentario);
                if (quantidadeCurtidasComentario.textContent == 1) {
                    curtidasComentario.appendChild(document.createTextNode(" curtida"));
                } else {
                    curtidasComentario.appendChild(document.createTextNode(" curtidas"));
                }
                curtidasComentario.appendChild(document.createElement("br"));
                comentarioRodape.appendChild(curtidasComentario);

                const denunciasPendentes = document.createElement("span");
                denunciasPendentes.textContent = "Denúncias pendentes: ";
                const quantidadeDenunciasComentarioPendentes = document.createElement("b");
                quantidadeDenunciasComentarioPendentes.textContent = await contarDenunciasComentarioPendentesAdmin(comentario.idComentario);
                if (quantidadeDenunciasComentarioPendentes.textContent == 0) {
                    quantidadeDenunciasComentarioPendentes.style.color = "#0F7124";
                } else {
                    quantidadeDenunciasComentarioPendentes.style.color = "#C40303";
                }

                denunciasPendentes.appendChild(quantidadeDenunciasComentarioPendentes);
                denunciasPendentes.appendChild(document.createElement("br"));
                comentarioRodape.appendChild(denunciasPendentes);

                const botaoExibirNoticia = document.createElement("button");
                botaoExibirNoticia.classList.add("exibir-noticia-btn");
                botaoExibirNoticia.textContent = "Exibir notícia";

                const botaoExibirDenuncias = document.createElement("button");
                botaoExibirDenuncias.classList.add("exibir-denuncias-btn");
                botaoExibirDenuncias.textContent = "Exibir denúncias";

                const denuncias = document.createElement("span");
                const quantidadeDenunciasComentario = document.createElement("b");
                quantidadeDenunciasComentario.textContent = await contarDenunciasComentarioAdmin(comentario.idComentario);

                denuncias.appendChild(quantidadeDenunciasComentario);
                if (quantidadeDenunciasComentario.textContent == 1) {
                    denuncias.appendChild(document.createTextNode(" denúncia"));
                } else {
                    denuncias.appendChild(document.createTextNode(" denúncias"));
                }
                denuncias.appendChild(document.createElement("br"));

                botaoExibirNoticia.addEventListener("click", async (e) => {
                    document.getElementById("listaNoticia").innerHTML = "";
                    exibirModal(modalNoticia, e);

                    await capturarNoticiaAdmin(comentario.idNoticia);
                });

                botaoExibirDenuncias.addEventListener("click", async (e) => {
                    document.getElementById("listaDenunciasComentario").innerHTML = "";
                    exibirModal(modalDenunciasComentario, e);

                    if (quantidadeDenunciasComentario.textContent == 0) {
                        document.getElementById("listaDenunciasComentario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este comentário não possui nenhuma denúncia.</p>";
                    } else {
                        paginaDenunciasComentario = 1;
                        await exibirDenunciasComentarioAdmin(comentario.idComentario, quantidadeDenunciasComentarioPendentes, quantidadeDenunciasComentario);
                    }
                });

                comentarioRodape.appendChild(botaoExibirNoticia);
                comentarioRodape.appendChild(botaoExibirDenuncias);
                comentarioRodape.appendChild(denuncias);

                const botaoApagarComentario = document.createElement("button");
                botaoApagarComentario.classList.add("apagar-comentario-btn");
                botaoApagarComentario.textContent = "Excluir comentário";

                botaoApagarComentario.addEventListener("click", async (e) => {
                    exibirModal(modalExcluirComentario, e);
                    document.getElementById("confirmarExcluirComentario").dataset.idComentario = comentario.idComentario;
                });

                comentarioRodape.appendChild(botaoApagarComentario);
                comentarioDiv.appendChild(comentarioCabecalho);
                comentarioDiv.appendChild(comentarioMain);
                comentarioDiv.appendChild(comentarioRodape);

                document.getElementById("listaComentarios").appendChild(comentarioDiv);
            }

            // Paginação
            const totalPaginas = Math.ceil(data.totalComentarios / 10);
            for (let i = 1; i <= totalPaginas; i++) {
                const btn = document.createElement("button");
                btn.textContent = i;

                if (i === pagina) {
                    btn.disabled = true;
                    btn.classList.add("ativo");
                }

                btn.onclick = () => {
                    document.querySelectorAll("#paginacaoComentarios button").forEach(b => {
                        b.classList.remove("ativo");
                        b.disabled = false;
                    });

                    btn.classList.add("ativo");
                    btn.disabled = true;

                    capturarComentariosAdmin(i);
                };

                paginacaoComentarios.appendChild(btn);
            }
        }
    } catch (error) {
        await exibirAlertaErro("error", "Erro", error.message);
    }
}

function formatarData(dataString) {
    const meses = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

    const [data, hora] = dataString.split(' ');
    const [ano, mes, dia] = data.split('-');
    const [horaStr, minuto] = hora.split(':');

    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]} de ${ano}, ${horaStr}:${minuto}`;
}

async function contarDenunciasComentarioPendentesAdmin(idComentario) {
    try {
        const res = await fetch(`/admin/contar-denuncias-comentario-pendentes/${encodeURIComponent(idComentario)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias pendentes do comentário!");
            throw new Error(errorData.message || "Erro ao contar denúncias pendentes do comentário!");
        }

        const data = await res.json();

        if (data.statusCode != 200) {
            await exibirAlertaErro("error", "Erro", data.message);
            return 0;
        } else {
            return data.quantidadeDenunciasComentarioPendentes;
        }
    } catch (error) {
        console.error("Erro ao contar denúncias pendentes do comentário:", error);
        return 0;
    }
}

async function pesquisarComentariosAdmin(busca, pagina = 1) {
    try {
        const res = await fetch(`/admin/pesquisar-comentarios?busca=${encodeURIComponent(busca)}&pagina=${pagina}`);
        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao pesquisar comentários!");
            throw new Error(data.message || "Erro ao pesquisar comentários");
        }

        const listaComentarios = document.getElementById("listaComentarios");
        const paginacaoComentarios = document.getElementById("paginacaoComentarios");

        // Se não tiver nenhuma notícia cadastrada
        if (!data.comentarios || data.comentarios.length === 0) {
            listaComentarios.style.textAlign = "center";
            listaComentarios.innerHTML = "Nenhum comentário foi encontrado.";

            if (listaComentarios.classList.contains("active")) {
                listaComentarios.classList.remove("active");
            }
            paginacaoComentarios.innerHTML = "";
        } else {
            listaComentarios.style.textAlign = "left";
            listaComentarios.innerHTML = "";
            paginacaoComentarios.innerHTML = "";
            if (!listaComentarios.classList.contains("active")) {
                listaComentarios.classList.add("active");
            }

            // Percorre as notícias
            for (const comentario of data.comentarios) {
                const comentarioDiv = document.createElement("div");
                comentarioDiv.classList.add("comentario");

                const comentarioCabecalho = document.createElement("header");

                const ladoEsquerdoCabecalho = document.createElement("div");
                ladoEsquerdoCabecalho.classList.add("lado-esquerdo");
                const ladoDireitoCabecalho = document.createElement("div");
                ladoDireitoCabecalho.classList.add("lado-direito");

                const fotoAutorComentario = document.createElement("img");
                fotoAutorComentario.src = comentario.fotoPerfil;

                ladoEsquerdoCabecalho.appendChild(fotoAutorComentario);
                comentarioCabecalho.appendChild(ladoEsquerdoCabecalho);

                const apelidoAutorComentario = document.createElement("p");
                apelidoAutorComentario.textContent = comentario.apelido;
                ladoDireitoCabecalho.appendChild(apelidoAutorComentario)

                const dataComentario = document.createElement("p");
                dataComentario.textContent = "Data publicação: " + formatarData(comentario.dataComentario);
                ladoDireitoCabecalho.appendChild(dataComentario);
                comentarioCabecalho.appendChild(ladoDireitoCabecalho);

                const comentarioMain = document.createElement("main");
                const textoComentario = document.createElement("p");
                textoComentario.textContent = comentario.comentario;
                comentarioMain.appendChild(textoComentario);

                const comentarioRodape = document.createElement("footer");
                const curtidasComentario = document.createElement("span");
                const quantidadeCurtidasComentario = document.createElement("b");
                quantidadeCurtidasComentario.textContent = await contarCurtidasComentarioNoticia(comentario.idComentario);

                curtidasComentario.appendChild(quantidadeCurtidasComentario);
                if (quantidadeCurtidasComentario.textContent == 1) {
                    curtidasComentario.appendChild(document.createTextNode(" curtida"));
                } else {
                    curtidasComentario.appendChild(document.createTextNode(" curtidas"));
                }
                curtidasComentario.appendChild(document.createElement("br"));
                comentarioRodape.appendChild(curtidasComentario);

                const denunciasPendentes = document.createElement("span");
                denunciasPendentes.textContent = "Denúncias pendentes: ";
                const quantidadeDenunciasComentarioPendentes = document.createElement("b");
                quantidadeDenunciasComentarioPendentes.textContent = await contarDenunciasComentarioPendentesAdmin(comentario.idComentario);
                if (quantidadeDenunciasComentarioPendentes.textContent == 0) {
                    quantidadeDenunciasComentarioPendentes.style.color = "#0F7124";
                } else {
                    quantidadeDenunciasComentarioPendentes.style.color = "#C40303";
                }

                denunciasPendentes.appendChild(quantidadeDenunciasComentarioPendentes);
                denunciasPendentes.appendChild(document.createElement("br"));
                comentarioRodape.appendChild(denunciasPendentes);

                const botaoExibirNoticia = document.createElement("button");
                botaoExibirNoticia.classList.add("exibir-noticia-btn");
                botaoExibirNoticia.textContent = "Exibir notícia"
                botaoExibirNoticia.addEventListener("click", async (e) => {
                    document.getElementById("listaNoticia").innerHTML = "";
                    exibirModal(modalNoticia, e);

                    await capturarNoticiaAdmin(comentario.idNoticia);
                });

                const botaoExibirDenuncias = document.createElement("button");
                botaoExibirDenuncias.classList.add("exibir-denuncias-btn");
                botaoExibirDenuncias.textContent = "Exibir denúncias"

                const denuncias = document.createElement("span");
                const quantidadeDenunciasComentario = document.createElement("b");
                quantidadeDenunciasComentario.textContent = await contarDenunciasComentarioAdmin(comentario.idComentario);

                denuncias.appendChild(quantidadeDenunciasComentario);
                if (quantidadeDenunciasComentario.textContent == 1) {
                    denuncias.appendChild(document.createTextNode(" denúncia"));
                } else {
                    denuncias.appendChild(document.createTextNode(" denúncias"));
                }
                denuncias.appendChild(document.createElement("br"));

                botaoExibirDenuncias.addEventListener("click", async (e) => {
                    document.getElementById("listaDenunciasComentario").innerHTML = "";
                    exibirModal(modalDenunciasComentario, e);

                    if (quantidadeDenunciasComentario.textContent == 0) {
                        document.getElementById("listaDenunciasComentario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este comentário não possui nenhuma denúncia.</p>";
                    } else {
                        paginaDenunciasComentario = 1;
                        await exibirDenunciasComentarioAdmin(comentario.idComentario, quantidadeDenunciasComentarioPendentes, quantidadeDenunciasComentario);
                    }
                });

                comentarioRodape.appendChild(botaoExibirNoticia);
                comentarioRodape.appendChild(botaoExibirDenuncias);
                comentarioRodape.appendChild(denuncias);

                const botaoApagarComentario = document.createElement("button");
                botaoApagarComentario.classList.add("apagar-comentario-btn");
                botaoApagarComentario.textContent = "Excluir comentário";

                botaoApagarComentario.addEventListener("click", async (e) => {
                    exibirModal(modalExcluirComentario, e);
                    document.getElementById("confirmarExcluirComentario").dataset.idComentario = comentario.idComentario;
                });

                comentarioRodape.appendChild(botaoApagarComentario);
                comentarioDiv.appendChild(comentarioCabecalho);
                comentarioDiv.appendChild(comentarioMain);
                comentarioDiv.appendChild(comentarioRodape);

                document.getElementById("listaComentarios").appendChild(comentarioDiv);
            }

            // Paginação
            const totalPaginas = Math.ceil(data.totalComentarios / 10);
            for (let i = 1; i <= totalPaginas; i++) {
                const btn = document.createElement("button");
                btn.textContent = i;

                if (i === pagina) {
                    btn.disabled = true;
                    btn.classList.add("ativo");
                }

                btn.onclick = () => {
                    document.querySelectorAll("#paginacaoComentarios button").forEach(b => {
                        b.classList.remove("ativo");
                        b.disabled = false;
                    });

                    btn.classList.add("ativo");
                    btn.disabled = true;

                    capturarComentariosAdmin(i);
                };

                paginacaoComentarios.appendChild(btn);
            }
        }
    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao pesquisar comentário!");
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

async function contarDenunciasComentarioAdmin(idComentario) {
    try {
        const res = await fetch(`/admin/contar-denuncias-comentario/${encodeURIComponent(idComentario)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias comentário!");
            throw new Error(errorData.message || "Erro ao contar denúncias comentário!");
        }

        const data = await res.json();

        if (data.statusCode != 200) {
            await exibirAlertaErro("error", "Erro", data.message);
            return 0;
        } else {
            return data.quantidadeDenunciasComentario;
        }
    } catch (error) {
        console.error("Erro ao contar denúncias comentário:", error);
        return 0;
    }
}

async function exibirDenunciasComentarioAdmin(idComentario, quantidadeDenunciasComentarioPendentes, quantidadeDenunciasComentario, quantidadeComentarios) {
    const denunciasComentario = await capturarDenunciasComentarioAdmin(idComentario, paginaDenunciasComentario);

    for (let i = 0; i < denunciasComentario.denuncias.length; i++) {
        const denunciaComentario = denunciasComentario.denuncias[i];

        const denuncia = document.createElement("div");
        denuncia.classList.add("denuncia-comentario");

        const denunciaCabecalho = document.createElement("header");

        const ladoEsquerdoCabecalho = document.createElement("div");
        ladoEsquerdoCabecalho.classList.add("lado-esquerdo");
        const ladoDireitoCabecalho = document.createElement("div");
        ladoDireitoCabecalho.classList.add("lado-direito");

        const fotoAutorDenuncia = document.createElement("img");
        fotoAutorDenuncia.src = denunciaComentario.fotoPerfil;

        ladoEsquerdoCabecalho.appendChild(fotoAutorDenuncia);
        denunciaCabecalho.appendChild(ladoEsquerdoCabecalho);

        const apelidoAutorDenuncia = document.createElement("a");
        apelidoAutorDenuncia.textContent = denunciaComentario.apelido;
        ladoDireitoCabecalho.appendChild(apelidoAutorDenuncia)

        const dataDenuncia = document.createElement("p");
        dataDenuncia.textContent = "Data publicação: " + formatarData(denunciaComentario.dataDenuncia);
        ladoDireitoCabecalho.appendChild(dataDenuncia);
        denunciaCabecalho.appendChild(ladoDireitoCabecalho);

        const denunciaMain = document.createElement("main");
        const categoriaDenuncia = document.createElement("p");
        categoriaDenuncia.textContent = "Categoria: " + denunciaComentario.categoria;
        denunciaMain.appendChild(categoriaDenuncia);

        const statusDenuncia = document.createElement("p");
        statusDenuncia.textContent = "Status: ";

        const statusD = document.createElement("b");
        statusD.textContent = denunciaComentario.status;

        statusDenuncia.appendChild(statusD);
        denunciaMain.appendChild(statusDenuncia);

        const dataRevisaoDenuncia = document.createElement("p");
        dataRevisaoDenuncia.textContent = "Data revisão: ";

        const revisao = document.createElement("b");
        if (denunciaComentario.dataRevisao == null) {
            revisao.textContent = "Pendente";
            dataRevisaoDenuncia.appendChild(revisao);
            denunciaMain.appendChild(dataRevisaoDenuncia);
        } else {
            denuncia.classList.add("aprovada");
            revisao.textContent = denunciaComentario.dataRevisao;

            const revisadoPor = document.createElement("p");
            revisadoPor.textContent = "Revisado por: ";
            const apelidoAdmin = document.createElement("b");
            apelidoAdmin.textContent = denunciaComentario.apelidoAdmin;

            revisadoPor.appendChild(apelidoAdmin);
            dataRevisaoDenuncia.appendChild(revisao);
            denunciaMain.appendChild(dataRevisaoDenuncia);
            denunciaMain.appendChild(revisadoPor);
        }

        denunciaMain.appendChild(dataRevisaoDenuncia);

        const descricaoDenuncia = document.createElement("p");
        descricaoDenuncia.textContent = "Descrição: " + denunciaComentario.descricao;
        denunciaMain.appendChild(descricaoDenuncia);

        denuncia.appendChild(denunciaCabecalho);
        denuncia.appendChild(denunciaMain);

        const denunciaRodape = document.createElement("footer");
        const botaoIgnorarDenuncia = document.createElement("button");
        botaoIgnorarDenuncia.classList.add("ignorar-denuncia-comentario-btn");
        botaoIgnorarDenuncia.textContent = "Ignorar";

        const botaoAprovarDenuncia = document.createElement("button");

        botaoIgnorarDenuncia.addEventListener("click", async function () {
            botaoAprovarDenuncia.disabled = true;
            botaoIgnorarDenuncia.disabled = true;

            await ignorarDenunciaComentario(denunciaComentario.idDenunciaComentario, denunciaComentario.idComentario);

            paginaDenunciasComentario = 1;
            document.getElementById("listaDenunciasComentario").innerHTML = "";
            quantidadeDenunciasComentario.textContent = await contarDenunciasComentarioAdmin(idComentario);
            if (quantidadeDenunciasComentario.textContent == 0) {
                document.getElementById("listaDenunciasComentario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este comentário não possui nenhuma denúncia.</p>";
            } else {
                paginaDenunciasComentario = 1;
                await exibirDenunciasComentarioAdmin(idComentario, quantidadeDenunciasComentarioPendentes, quantidadeDenunciasComentario, quantidadeComentarios);
            }

            quantidadeDenunciasComentarioPendentes.textContent = await contarDenunciasComentarioPendentesAdmin(idComentario);
            if (quantidadeDenunciasComentarioPendentes.textContent == 0) {
                quantidadeDenunciasComentarioPendentes.style.color = "#0F7124";
            } else {
                quantidadeDenunciasComentarioPendentes.style.color = "#C40303";
            }
            quantidadeDenunciasComentario.textContent = await contarDenunciasComentarioAdmin(idComentario);
        });

        botaoAprovarDenuncia.classList.add("aprovar-denuncia-comentario-btn");
        botaoAprovarDenuncia.textContent = "Aprovar";

        botaoAprovarDenuncia.addEventListener("click", async function () {
            botaoAprovarDenuncia.disabled = true;
            botaoIgnorarDenuncia.disabled = true;

            await aprovarDenunciaComentario(denunciaComentario.idDenunciaComentario, apelido, denunciaComentario.idComentario);

            paginaDenunciasComentario = 1;
            document.getElementById("listaComentarios").innerHTML = "";
            document.getElementById("listaDenunciasComentario").innerHTML = "";

            capturarComentariosAdmin(1);

            esconderModal(modalDenunciasComentario);
        });

        denunciaRodape.appendChild(botaoAprovarDenuncia);
        denunciaRodape.appendChild(botaoIgnorarDenuncia);
        denuncia.appendChild(denunciaRodape);

        // Se for o último elemento da página
        if (i === denunciasComentario.denuncias.length - 1) {
            const observer = new IntersectionObserver((entries, observerRef) => {
                entries.forEach(async entry => {
                    if (entry.isIntersecting && entry.intersectionRatio === 1) {
                        observerRef.unobserve(entry.target);

                        // verifica se ainda há comentários para carregar
                        const totalDenunciasComentario = parseInt(quantidadeDenunciasComentario.textContent, 10); // Total geral
                        const denunciasComentarioAtuais = denunciasComentario.denuncias.length; // Comentários na página atual

                        if ((paginaDenunciasComentario * denunciasComentarioAtuais) < totalDenunciasComentario) {
                            paginaDenunciasComentario++;
                            await exibirDenunciasComentarioAdmin(apelido, quantidadeDenunciasComentarioPendentes, quantidadeDenunciasComentario, quantidadeComentarios);
                        }
                    }
                });
            }, {
                threshold: 1.0 // Só dispara quando 100% visível
            });

            observer.observe(denuncia);
        }

        document.getElementById("listaDenunciasComentario").appendChild(denuncia);
    }
}

async function aprovarDenunciaComentario(idDenunciaComentario, apelidoAdmin, idComentario) {
    try {
        const res = await fetch('/admin/aprovar-denuncia-comentario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idDenunciaComentario, apelidoAdmin, idComentario }),
        });

        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao aprovar denúncia comentário!");
            throw new Error(data.message || "Erro ao aprovar denúncia comentário");
        }

        return data;

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao aprovar denúncia comentário!");
        console.error('Erro na requisição: ' + error.message);
    }
}

async function ignorarDenunciaComentario(idDenunciaComentario, idComentario) {
    try {
        const res = await fetch('/admin/ignorar-denuncia-comentario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idDenunciaComentario, idComentario }),
        });

        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao ignorar denúncia comentário!");
            throw new Error(data.message || "Erro ao ignorar denúncia comentário");
        }

        return data;

    } catch (error) {
        await exibirAlertaErro("error", "Erro", "Erro ao ignorar denúncia comentário!");
        console.error('Erro na requisição: ' + error.message);
    }
}

async function capturarDenunciasComentarioAdmin(idComentario, paginaDenunciasComentario = 1) {
    try {
        const res = await fetch(
            `/admin/capturar-denuncias-comentario/${encodeURIComponent(idComentario)}/${encodeURIComponent(paginaDenunciasComentario)}`
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            await exibirAlertaErro("error", "Erro", "Erro ao buscar denúncias do comentário!");
            throw new Error(errorData.message || "Erro ao buscar denúncias do comentário");
        }

        const data = await res.json();

        return {
            denuncias: data.denuncias,
            totalDenunciasComentario: data.totalDenunciasComentario
        };
    } catch (error) {
        console.error(error);
        await exibirAlertaErro("error", "Erro", error.message);
        return { denuncias: [], totalDenunciasComentario: 0 };
    }
}

async function capturarNoticiaAdmin(idNoticia) {
    try {
        const res = await fetch(`/admin/capturar-noticia?idNoticia=${idNoticia}`);
        const data = await res.json();

        if (!res.ok) {
            await exibirAlertaErro("error", "Erro", "Erro ao capturar notícia!");
            throw new Error(data.message || "Erro ao capturar notícia");
        }

        const listaNoticia = document.getElementById("listaNoticia");

        if (data.noticia == null) {
            listaNoticia.style.textAlign = "center";
            listaNoticia.innerHTML = "Nenhuma notícia foi encontrada.";

            if (listaNoticia.classList.contains("active")) {
                listaNoticia.classList.remove("active");
            }
        } else {
            listaNoticia.style.textAlign = "left";
            listaNoticia.innerHTML = "";
            if (!listaNoticia.classList.contains("active")) {
                listaNoticia.classList.add("active");
            }

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

            if (noticia.status != "null") {
                if (noticia.status == "Aguardando revisão dos administradores") {
                    noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: noticia.status, className: "status-noticia pendente" }));
                } else {
                    noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: noticia.status, className: "status-noticia aprovada" }));
                }
            }

            // Status da notícia
            const statusNoticia = document.createElement("span");
            statusNoticia.textContent = "Status: ";

            const statusN = document.createElement("b");
            if (noticia.desativado == 0) {
                statusN.style.color = "#0F7124";
                statusN.textContent = "Ativo";
            } else {
                statusN.style.color = "#C40303";
                statusN.textContent = "Desativado";
            }

            statusNoticia.appendChild(statusN);
            statusNoticia.appendChild(document.createElement("br"));
            noticiaDiv.appendChild(statusNoticia);

            noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Bairro: ${noticia.nomeBairro}` }));
            noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Autor: ${noticia.apelido}` }));

            const dataFormatada = formatarData(noticia.dataNoticia);
            noticiaDiv.appendChild(Object.assign(document.createElement("p"), { textContent: `Data de criação: ${dataFormatada}` }));

            // Curtidas
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
            noticiaDiv.appendChild(curtidas);

            // Denúncias
            const denunciasAprovadas = document.createElement("span");
            denunciasAprovadas.textContent = "Denúncias aprovadas: ";
            const quantidadeDenunciasNoticiaAprovadas = document.createElement("b");
            quantidadeDenunciasNoticiaAprovadas.textContent = await contarDenunciasNoticiaAprovadasAdmin(noticia.idNoticia);
            if (quantidadeDenunciasNoticiaAprovadas.textContent == 0) {
                quantidadeDenunciasNoticiaAprovadas.style.color = "#0F7124";
            } else {
                quantidadeDenunciasNoticiaAprovadas.style.color = "#C40303";
            }

            denunciasAprovadas.appendChild(quantidadeDenunciasNoticiaAprovadas);
            denunciasAprovadas.appendChild(document.createElement("br"));
            noticiaDiv.appendChild(denunciasAprovadas);

            const denunciasPendentes = document.createElement("span");
            denunciasPendentes.textContent = "Denúncias pendentes: ";
            const quantidadeDenunciasNoticiaPendentes = document.createElement("b");
            quantidadeDenunciasNoticiaPendentes.textContent = await contarDenunciasNoticiaPendentesAdmin(noticia.idNoticia);
            if (quantidadeDenunciasNoticiaPendentes.textContent == 0) {
                quantidadeDenunciasNoticiaPendentes.style.color = "#0F7124";
            } else {
                quantidadeDenunciasNoticiaPendentes.style.color = "#C40303";
            }

            denunciasPendentes.appendChild(quantidadeDenunciasNoticiaPendentes);
            denunciasPendentes.appendChild(document.createElement("br"));
            noticiaDiv.appendChild(denunciasPendentes);

            console.log(JSON.stringify(noticia));
            
            if (quantidadeDenunciasNoticiaAprovadas.textContent < 1) {
                if (noticia.desativado == 0) {
                    // Desativar notícia
                    const botaoDesativarNoticia = document.createElement("button");
                    botaoDesativarNoticia.classList.add("desativar-noticia-btn");
                    botaoDesativarNoticia.textContent = "Desativar notícia";

                    botaoDesativarNoticia.addEventListener("click", async (e) => {
                        exibirModal(modalDesativarNoticia, e);
                        document.getElementById("confirmarDesativarNoticia").dataset.idNoticia = noticia.idNoticia;
                    });

                    noticiaDiv.appendChild(botaoDesativarNoticia);
                } else {
                    // Ativar notícia
                    const botaoAtivarNoticia = document.createElement("button");
                    botaoAtivarNoticia.classList.add("ativar-noticia-btn");
                    botaoAtivarNoticia.textContent = "Ativar notícia";

                    botaoAtivarNoticia.addEventListener("click", async (e) => {
                        exibirModal(modalAtivarNoticia, e);
                        document.getElementById("confirmarAtivarNoticia").dataset.idNoticia = noticia.idNoticia;
                    });

                    noticiaDiv.appendChild(botaoAtivarNoticia);
                }
            }

            listaNoticia.appendChild(noticiaDiv);
        }
    } catch (error) {
        await exibirAlertaErro("error", "Erro", error.message);
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

async function contarDenunciasNoticiaAprovadasAdmin(idNoticia) {
    try {
        const res = await fetch(`/admin/contar-denuncias-noticia-aprovadas/${encodeURIComponent(idNoticia)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias aprovadas da notícia!");
            throw new Error(errorData.message || "Erro ao contar denúncias aprovadas da notícia!");
        }

        const data = await res.json();

        if (data.statusCode != 200) {
            await exibirAlertaErro("error", "Erro", data.message);
            return 0;
        } else {
            return data.quantidadeDenunciasNoticiaAprovadas;
        }
    } catch (error) {
        console.error("Erro ao contar denúncias aprovadas da notícia:", error);
        return 0;
    }
}

async function contarDenunciasNoticiaPendentesAdmin(idNoticia) {
    try {
        const res = await fetch(`/admin/contar-denuncias-noticia-pendentes/${encodeURIComponent(idNoticia)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias pendentes da notícia!");
            throw new Error(errorData.message || "Erro ao contar denúncias pendentes da notícia!");
        }

        const data = await res.json();

        if (data.statusCode != 200) {
            await exibirAlertaErro("error", "Erro", data.message);
            return 0;
        } else {
            return data.quantidadeDenunciasNoticiaPendentes;
        }
    } catch (error) {
        console.error("Erro ao contar denúncias pendentes da notícia:", error);
        return 0;
    }
}

async function contarDenunciasNoticiaAdmin(idNoticia) {
    try {
        const res = await fetch(`/admin/contar-denuncias-noticia/${encodeURIComponent(idNoticia)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias notícia!");
            throw new Error(errorData.message || "Erro ao contar denúncias notícia!");
        }

        const data = await res.json();

        if (data.statusCode != 200) {
            await exibirAlertaErro("error", "Erro", data.message);
            return 0;
        } else {
            return data.quantidadeDenunciasNoticia;
        }
    } catch (error) {
        console.error("Erro ao contar denúncias notícia:", error);
        return 0;
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

        const apelidoAutorComentario = document.createElement("p");
        apelidoAutorComentario.textContent = comentarioNoticia.apelido;
        ladoDireitoCabecalho.appendChild(apelidoAutorComentario)

        const dataComentario = document.createElement("p");
        dataComentario.textContent = "Data publicação: " + formatarData(comentarioNoticia.dataComentario);
        ladoDireitoCabecalho.appendChild(dataComentario);
        comentarioCabecalho.appendChild(ladoDireitoCabecalho);

        const comentarioMain = document.createElement("main");
        const textoComentario = document.createElement("p");
        textoComentario.textContent = comentarioNoticia.comentario;
        comentarioMain.appendChild(textoComentario);

        const comentarioRodape = document.createElement("footer");
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
        comentarioRodape.appendChild(curtidasComentario);

        const denunciasPendentes = document.createElement("span");
        denunciasPendentes.textContent = "Denúncias pendentes: ";
        const quantidadeDenunciasComentarioPendentes = document.createElement("b");
        quantidadeDenunciasComentarioPendentes.textContent = await contarDenunciasComentarioPendentesAdmin(comentarioNoticia.idComentario);
        if (quantidadeDenunciasComentarioPendentes.textContent == 0) {
            quantidadeDenunciasComentarioPendentes.style.color = "#0F7124";
        } else {
            quantidadeDenunciasComentarioPendentes.style.color = "#C40303";
        }

        denunciasPendentes.appendChild(quantidadeDenunciasComentarioPendentes);
        denunciasPendentes.appendChild(document.createElement("br"));
        comentarioRodape.appendChild(denunciasPendentes);

        const botaoExibirDenuncias = document.createElement("button");
        botaoExibirDenuncias.classList.add("exibir-denuncias-btn");
        botaoExibirDenuncias.textContent = "Exibir denúncias"

        const denuncias = document.createElement("span");
        const quantidadeDenunciasComentario = document.createElement("b");
        quantidadeDenunciasComentario.textContent = await contarDenunciasComentarioAdmin(comentarioNoticia.idComentario);

        denuncias.appendChild(quantidadeDenunciasComentario);
        if (quantidadeDenunciasComentario.textContent == 1) {
            denuncias.appendChild(document.createTextNode(" denúncia"));
        } else {
            denuncias.appendChild(document.createTextNode(" denúncias"));
        }
        denuncias.appendChild(document.createElement("br"));

        botaoExibirDenuncias.addEventListener("click", async (e) => {
            document.getElementById("listaDenunciasComentario").innerHTML = "";
            exibirModal(modalDenunciasComentario, e);

            if (quantidadeDenunciasComentario.textContent == 0) {
                document.getElementById("listaDenunciasComentario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este comentário não possui nenhuma denúncia.</p>";
            } else {
                paginaDenunciasComentario = 1;
                await exibirDenunciasComentarioAdmin(comentarioNoticia.idComentario, quantidadeDenunciasComentarioPendentes, quantidadeDenunciasComentario, quantidadeComentarios);
            }
        });

        comentarioRodape.appendChild(botaoExibirDenuncias);
        comentarioRodape.appendChild(denuncias);

        const botaoApagarComentario = document.createElement("button");
        botaoApagarComentario.classList.add("apagar-comentario-btn");
        botaoApagarComentario.textContent = "Excluir comentário";

        botaoApagarComentario.addEventListener("click", async (e) => {
            document.getElementById("listaComentarios").innerHTML = "";

            await apagarComentarioNoticia(comentarioNoticia.idComentario);

            quantidadeComentarios.textContent = await contarComentariosNoticia(idNoticia);
            if (quantidadeComentarios.textContent == 0) {
                document.getElementById("listaComentarios").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Esta notícia não possui nenhum comentário.</p>";
            } else {
                paginaComentarios = 1;
                await exibirComentariosNoticia(idNoticia, quantidadeComentarios);
            }
        });

        comentarioRodape.appendChild(botaoApagarComentario);
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