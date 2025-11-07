import { exibirAlertaErro, exibirAlertaErroERedirecionar, exibirAlertaSucesso } from "./alert.js";
import { exibirModal, esconderModal } from "./modal.js";

let apelido = "";
let paginaDenunciasUsuario = 0;
const modalDenunciasUsuario = document.getElementById("denunciasUsuarioModal");
const modalDesativarUsuario = document.getElementById("desativarUsuarioModal");
const modalAtivarUsuario = document.getElementById("ativarUsuarioModal");
const cancelarDesativarUsuario = document.getElementById("cancelarDesativarUsuario");
const cancelarAtivarUsuario = document.getElementById("cancelarAtivarUsuario");
cancelarDesativarUsuario.addEventListener("click", () => {
  esconderModal(modalDesativarUsuario);
});
cancelarAtivarUsuario.addEventListener("click", () => {
  esconderModal(modalAtivarUsuario);
});

const barraDePesquisa = document.getElementById("barraDePesquisa");
let ultimaTecla = "";
barraDePesquisa.addEventListener("keydown", (event) => {
  ultimaTecla = event.key;
});

barraDePesquisa.addEventListener("input", (event) => {
  const busca = event.target.value.trim();

  if (busca !== "") {
    pesquisarUsuariosAdmin(busca, 1);
  } else if (ultimaTecla === "Backspace") {
    capturarUsuariosAdmin(1);
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

      capturarUsuariosAdmin(1);

      document.getElementById("confirmarDesativarUsuario").addEventListener("click", async function () {
        let apelidoUsuarioAtual = document.getElementById("confirmarDesativarUsuario").dataset.apelido;
        try {
          const resposta = await fetch("/admin/desativar-perfil-usuario", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ apelidoUsuarioAtual })
          });

          const resultado = await resposta.json();
          capturarUsuariosAdmin(1);
          esconderModal(modalDesativarUsuario);
        } catch (erro) {
          await exibirAlertaErro("error", "Erro", "Erro ao tentar desativar perfil!");
          console.error(erro);
        }
      });

      document.getElementById("confirmarAtivarUsuario").addEventListener("click", async function () {
        let apelidoUsuarioAtual = document.getElementById("confirmarAtivarUsuario").dataset.apelido;
        try {
          const resposta = await fetch("/admin/ativar-perfil-usuario", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ apelidoUsuarioAtual })
          });

          const resultado = await resposta.json();
          capturarUsuariosAdmin(1);
          esconderModal(modalAtivarUsuario);
        } catch (erro) {
          await exibirAlertaErro("error", "Erro", "Erro ao tentar ativar perfil!");
          console.error(erro);
        }
      });
    })
    .catch(async (err) => {
      console.error(err.message);
      await exibirAlertaErroERedirecionar("error", "Erro", err.message, "/admin/login.html");
    });
});

async function capturarUsuariosAdmin(pagina = 1) {
  try {
    const res = await fetch(`/admin/capturar-usuarios?pagina=${pagina}`);
    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao capturar usuários!");
      throw new Error(data.message || "Erro ao capturar usuários");
    }

    const listaUsuarios = document.getElementById("listaUsuarios");
    const paginacaoUsuarios = document.getElementById("paginacaoUsuarios");

    // Se não tiver nenhum usuário cadastrado
    if (!data.usuarios || data.usuarios.length === 0) {
      listaUsuarios.style.textAlign = "center";
      listaUsuarios.innerHTML = "Nenhum usuário foi encontrado.";

      if (listaUsuarios.classList.contains("active")) {
        listaUsuarios.classList.remove("active");
      }
      paginacaoUsuarios.innerHTML = "";
    } else {
      listaUsuarios.style.textAlign = "left";
      listaUsuarios.innerHTML = "";
      paginacaoUsuarios.innerHTML = "";
      if (!listaUsuarios.classList.contains("active")) {
        listaUsuarios.classList.add("active");
      }

      // Percorre os usuários
      for (const usuario of data.usuarios) {
        const usuarioDiv = document.createElement("div");
        usuarioDiv.classList.add("usuario");
  
        const cabecalho = document.createElement("div");
        cabecalho.classList.add("cabecalho");
        cabecalho.appendChild(Object.assign(document.createElement("img"), { src: usuario.fotoPerfil }));

        const ladoDireito = document.createElement("div");
        ladoDireito.appendChild(Object.assign(document.createElement("p"), { textContent: usuario.apelido }));
        
        const dataFormatada = formatarData(usuario.dataCriacao);
        ladoDireito.appendChild(Object.assign(document.createElement("p"), { textContent: `Data de criação: ${dataFormatada}` }));

        cabecalho.appendChild(ladoDireito);
        usuarioDiv.appendChild(cabecalho);

        // Status do perfil
        const statusPerfil = document.createElement("span");
        statusPerfil.textContent = "Status: ";

        const statusP = document.createElement("b");
        if (usuario.desativado == 0) {
          statusP.style.color = "#0F7124";
          statusP.textContent = "Ativo";
        } else {
          statusP.style.color = "#C40303";
          statusP.textContent = "Desativado";
        }

        statusPerfil.appendChild(statusP);
        statusPerfil.appendChild(document.createElement("br"));
        usuarioDiv.appendChild(statusPerfil);

        // Denúncias
        const denunciasAprovadas = document.createElement("span");
        denunciasAprovadas.textContent = "Denúncias aprovadas: ";
        const quantidadeDenunciasUsuarioAprovadas = document.createElement("b");
        quantidadeDenunciasUsuarioAprovadas.textContent = await contarDenunciasUsuarioAprovadasAdmin(usuario.apelido);
        if (quantidadeDenunciasUsuarioAprovadas.textContent == 0) {
          quantidadeDenunciasUsuarioAprovadas.style.color = "#0F7124";
        } else {
          quantidadeDenunciasUsuarioAprovadas.style.color = "#C40303";
        }
        
        denunciasAprovadas.appendChild(quantidadeDenunciasUsuarioAprovadas);
        denunciasAprovadas.appendChild(document.createElement("br"));
        usuarioDiv.appendChild(denunciasAprovadas);

        const denunciasPendentes = document.createElement("span");
        denunciasPendentes.textContent = "Denúncias pendentes: ";
        const quantidadeDenunciasUsuarioPendentes = document.createElement("b");
        quantidadeDenunciasUsuarioPendentes.textContent = await contarDenunciasUsuarioPendentesAdmin(usuario.apelido);
        if (quantidadeDenunciasUsuarioPendentes.textContent == 0) {
          quantidadeDenunciasUsuarioPendentes.style.color = "#0F7124";
        } else {
          quantidadeDenunciasUsuarioPendentes.style.color = "#C40303";
        }

        denunciasPendentes.appendChild(quantidadeDenunciasUsuarioPendentes);
        denunciasPendentes.appendChild(document.createElement("br"));
        usuarioDiv.appendChild(denunciasPendentes);

        const botaoExibirDenuncias = document.createElement("button");
        botaoExibirDenuncias.classList.add("exibir-denuncias-btn");
        botaoExibirDenuncias.textContent = "Exibir denúncias"

        const denuncias = document.createElement("span");
        const quantidadeDenunciasUsuario = document.createElement("b");
        quantidadeDenunciasUsuario.textContent = await contarDenunciasUsuarioAdmin(usuario.apelido);

        denuncias.appendChild(quantidadeDenunciasUsuario);
        if (quantidadeDenunciasUsuario.textContent == 1) {
          denuncias.appendChild(document.createTextNode(" denúncia"));
        } else {
          denuncias.appendChild(document.createTextNode(" denúncias"));
        }
        denuncias.appendChild(document.createElement("br"));

        botaoExibirDenuncias.addEventListener("click", async (e) => {
          document.getElementById("listaDenunciasUsuario").innerHTML = "";
          exibirModal(modalDenunciasUsuario, e);
          
          if (quantidadeDenunciasUsuario.textContent == 0) {
            document.getElementById("listaDenunciasUsuario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este usuário não possui nenhuma denúncia.</p>";
          } else {
            paginaDenunciasUsuario = 1;
            await exibirDenunciasUsuarioAdmin(usuario.apelido, quantidadeDenunciasUsuarioAprovadas, quantidadeDenunciasUsuarioPendentes, quantidadeDenunciasUsuario);
          }
        });

        if (quantidadeDenunciasUsuarioAprovadas.textContent < 3) {
          if (usuario.desativado == 0) {
            // Desativar usuário
            const botaoDesativarUsuario = document.createElement("button");
            botaoDesativarUsuario.classList.add("desativar-usuario-btn");
            botaoDesativarUsuario.textContent = "Desativar usuário";

            botaoDesativarUsuario.addEventListener("click", async (e) => {
              exibirModal(modalDesativarUsuario, e);
              document.getElementById("confirmarDesativarUsuario").dataset.apelido = usuario.apelido;
            });

            usuarioDiv.appendChild(botaoExibirDenuncias);
            usuarioDiv.appendChild(denuncias);
            usuarioDiv.appendChild(botaoDesativarUsuario);
          } else {
            // Ativar usuário
            const botaoAtivarUsuario = document.createElement("button");
            botaoAtivarUsuario.classList.add("ativar-usuario-btn");
            botaoAtivarUsuario.textContent = "Ativar usuário";

            botaoAtivarUsuario.addEventListener("click", async (e) => {
              exibirModal(modalAtivarUsuario, e);
              document.getElementById("confirmarAtivarUsuario").dataset.apelido = usuario.apelido;
            });

            usuarioDiv.appendChild(botaoExibirDenuncias);
            usuarioDiv.appendChild(denuncias);
            usuarioDiv.appendChild(botaoAtivarUsuario);
          }
        } else {
          usuarioDiv.appendChild(botaoExibirDenuncias);
          usuarioDiv.appendChild(denuncias);
        }

        listaUsuarios.appendChild(usuarioDiv);
      }

      // Paginação
      const totalPaginas = Math.ceil(data.totalUsuarios / 10);
      for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
  
        if (i === pagina) {
          btn.disabled = true;
          btn.classList.add("ativo");
        }
      
        btn.onclick = () => {
          document.querySelectorAll("#paginacaoUsuarios button").forEach(b => {
            b.classList.remove("ativo");
            b.disabled = false;
          });
  
          btn.classList.add("ativo");
          btn.disabled = true;
  
          capturarUsuariosAdmin(i);
        };
  
        paginacaoUsuarios.appendChild(btn);
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

async function contarDenunciasUsuarioAprovadasAdmin(apelido) {
  try {
    const res = await fetch(`/admin/contar-denuncias-usuario-aprovadas/${encodeURIComponent(apelido)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias aprovadas do usuário!");
      throw new Error(errorData.message || "Erro ao contar denúncias aprovadas do usuário!");
    }

    const data = await res.json();

    if (data.statusCode != 200) {
      await exibirAlertaErro("error", "Erro", data.message);
      return 0;
    } else {
      return data.quantidadeDenunciasUsuarioAprovadas;
    }
  } catch (error) {
    console.error("Erro ao contar denúncias aprovadas do usuário:", error);
    return 0;
  }
}

async function contarDenunciasUsuarioPendentesAdmin(apelido) {
  try {
    const res = await fetch(`/admin/contar-denuncias-usuario-pendentes/${encodeURIComponent(apelido)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias pendentes do usuário!");
      throw new Error(errorData.message || "Erro ao contar denúncias pendentes do usuário!");
    }

    const data = await res.json();

    if (data.statusCode != 200) {
      await exibirAlertaErro("error", "Erro", data.message);
      return 0;
    } else {
      return data.quantidadeDenunciasUsuarioPendentes;
    }
  } catch (error) {
    console.error("Erro ao contar denúncias pendentes do usuário:", error);
    return 0;
  }
}

async function contarDenunciasUsuarioAdmin(apelido) {
  try {
    const res = await fetch(`/admin/contar-denuncias-usuario/${encodeURIComponent(apelido)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      await exibirAlertaErro("error", "Erro", "Erro ao contar denúncias usuário!");
      throw new Error(errorData.message || "Erro ao contar denúncias usuário!");
    }

    const data = await res.json();

    if (data.statusCode != 200) {
      await exibirAlertaErro("error", "Erro", data.message);
      return 0;
    } else {
      return data.quantidadeDenunciasUsuario;
    }
  } catch (error) {
    console.error("Erro ao contar denúncias usuário:", error);
    return 0;
  }
}

async function exibirDenunciasUsuarioAdmin(apelidoDenunciado, quantidadeDenunciasUsuarioAprovadas, quantidadeDenunciasUsuarioPendentes, quantidadeDenunciasUsuario) {
  const denunciasUsuario = await capturarDenunciasUsuarioAdmin(apelidoDenunciado, paginaDenunciasUsuario);
  
  for (let i = 0; i < denunciasUsuario.denuncias.length; i++) {
    const denunciaUsuario = denunciasUsuario.denuncias[i];

    const denuncia = document.createElement("div");
    denuncia.classList.add("denuncia-usuario");

    const denunciaCabecalho = document.createElement("header");
            
    const ladoEsquerdoCabecalho = document.createElement("div");
    ladoEsquerdoCabecalho.classList.add("lado-esquerdo");
    const ladoDireitoCabecalho = document.createElement("div");
    ladoDireitoCabecalho.classList.add("lado-direito");

    const fotoAutorDenuncia = document.createElement("img");
    fotoAutorDenuncia.src = denunciaUsuario.fotoPerfil;

    ladoEsquerdoCabecalho.appendChild(fotoAutorDenuncia);
    denunciaCabecalho.appendChild(ladoEsquerdoCabecalho);

    const apelidoAutorDenuncia = document.createElement("a");
    apelidoAutorDenuncia.textContent = denunciaUsuario.apelido;
    ladoDireitoCabecalho.appendChild(apelidoAutorDenuncia)
  
    const dataDenuncia = document.createElement("p");
    dataDenuncia.textContent = "Data publicação: " + formatarData(denunciaUsuario.dataDenuncia);
    ladoDireitoCabecalho.appendChild(dataDenuncia);
    denunciaCabecalho.appendChild(ladoDireitoCabecalho);

    const denunciaMain = document.createElement("main");
    const categoriaDenuncia = document.createElement("p");
    categoriaDenuncia.textContent = "Categoria: " + denunciaUsuario.categoria;
    denunciaMain.appendChild(categoriaDenuncia);
    
    const statusDenuncia = document.createElement("p");
    statusDenuncia.textContent = "Status: ";
    
    const statusD = document.createElement("b");
    statusD.textContent = denunciaUsuario.status;

    statusDenuncia.appendChild(statusD);
    denunciaMain.appendChild(statusDenuncia);
    
    const dataRevisaoDenuncia = document.createElement("p");
    dataRevisaoDenuncia.textContent = "Data revisão: ";

    const revisao = document.createElement("b");
    if (denunciaUsuario.dataRevisao == null) {
      revisao.textContent = "Pendente";
      dataRevisaoDenuncia.appendChild(revisao);
      denunciaMain.appendChild(dataRevisaoDenuncia);
    } else {
      denuncia.classList.add("aprovada");
      revisao.textContent = denunciaUsuario.dataRevisao;

      const revisadoPor = document.createElement("p");
      revisadoPor.textContent = "Revisado por: ";
      const apelidoAdmin = document.createElement("b");
      apelidoAdmin.textContent = denunciaUsuario.apelidoAdmin;

      revisadoPor.appendChild(apelidoAdmin);
      dataRevisaoDenuncia.appendChild(revisao);
      denunciaMain.appendChild(dataRevisaoDenuncia);
      denunciaMain.appendChild(revisadoPor);
    }

    denunciaMain.appendChild(dataRevisaoDenuncia);
    
    const descricaoDenuncia = document.createElement("p");
    descricaoDenuncia.textContent = "Descrição: " + denunciaUsuario.descricao;
    denunciaMain.appendChild(descricaoDenuncia);

    denuncia.appendChild(denunciaCabecalho);
    denuncia.appendChild(denunciaMain);
    
    const denunciaRodape = document.createElement("footer");
    const botaoIgnorarDenuncia = document.createElement("button");
    botaoIgnorarDenuncia.classList.add("ignorar-denuncia-usuario-btn");
    botaoIgnorarDenuncia.textContent = "Ignorar";

    const botaoAprovarDenuncia = document.createElement("button");

    botaoIgnorarDenuncia.addEventListener("click", async function() {
      botaoAprovarDenuncia.disabled = true;
      botaoIgnorarDenuncia.disabled = true;

      await ignorarDenunciaUsuario(denunciaUsuario.idDenunciaUsuario, denunciaUsuario.apelidoDenunciado);
      
      paginaDenunciasUsuario = 1;
      document.getElementById("listaDenunciasUsuario").innerHTML = "";
      quantidadeDenunciasUsuario.textContent = await contarDenunciasUsuarioAdmin(apelidoDenunciado);
      if (quantidadeDenunciasUsuario.textContent == 0) {
        document.getElementById("listaDenunciasUsuario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este usuário não possui nenhuma denúncia.</p>";
      } else {
        paginaDenunciasUsuario = 1;
        await exibirDenunciasUsuarioAdmin(apelidoDenunciado, quantidadeDenunciasUsuarioAprovadas, quantidadeDenunciasUsuarioPendentes, quantidadeDenunciasUsuario);
      }

      quantidadeDenunciasUsuarioAprovadas.textContent = await contarDenunciasUsuarioAprovadasAdmin(apelidoDenunciado);
      if (quantidadeDenunciasUsuarioAprovadas.textContent == 2) {
        await capturarUsuariosAdmin(1);
      }
      if (quantidadeDenunciasUsuarioAprovadas.textContent == 0) {
        quantidadeDenunciasUsuarioAprovadas.style.color = "#0F7124";
      } else {
        quantidadeDenunciasUsuarioAprovadas.style.color = "#C40303";
      }
      quantidadeDenunciasUsuarioPendentes.textContent = await contarDenunciasUsuarioPendentesAdmin(apelidoDenunciado);
      if (quantidadeDenunciasUsuarioPendentes.textContent == 0) {
        quantidadeDenunciasUsuarioPendentes.style.color = "#0F7124";
      } else {
        quantidadeDenunciasUsuarioPendentes.style.color = "#C40303";
      }
      quantidadeDenunciasUsuario.textContent = await contarDenunciasUsuarioAdmin(apelidoDenunciado);
    });

    if (denunciaUsuario.status != "Aprovada") {
      botaoAprovarDenuncia.classList.add("aprovar-denuncia-usuario-btn");
      botaoAprovarDenuncia.textContent = "Aprovar";
      
      botaoAprovarDenuncia.addEventListener("click", async function() {
        botaoAprovarDenuncia.disabled = true;
        botaoIgnorarDenuncia.disabled = true;
        let aprovacaoDenunciaUsuario = await aprovarDenunciaUsuario(denunciaUsuario.idDenunciaUsuario, apelido, denunciaUsuario.apelidoDenunciado);

        paginaDenunciasUsuario = 1;
        document.getElementById("listaDenunciasUsuario").innerHTML = "";

        if (aprovacaoDenunciaUsuario.quantidadeDenunciasUsuarioAprovadas >= 3) {
          capturarUsuariosAdmin(1);
          esconderModal(modalDenunciasUsuario);
        } else {
          if (await contarDenunciasUsuarioAdmin(apelidoDenunciado) == 0) {
            document.getElementById("listaDenunciasUsuario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este usuário não possui nenhuma denúncia.</p>";
          } else {
            paginaDenunciasUsuario = 1;
            await exibirDenunciasUsuarioAdmin(apelidoDenunciado, quantidadeDenunciasUsuarioAprovadas, quantidadeDenunciasUsuarioPendentes, quantidadeDenunciasUsuario);
          }

          quantidadeDenunciasUsuarioAprovadas.textContent = await contarDenunciasUsuarioAprovadasAdmin(apelidoDenunciado);
          if (quantidadeDenunciasUsuarioAprovadas.textContent == 0) {
            quantidadeDenunciasUsuarioAprovadas.style.color = "#0F7124";
          } else {
            quantidadeDenunciasUsuarioAprovadas.style.color = "#C40303";
          }
          quantidadeDenunciasUsuarioPendentes.textContent = await contarDenunciasUsuarioPendentesAdmin(apelidoDenunciado);
          if (quantidadeDenunciasUsuarioPendentes.textContent == 0) {
            quantidadeDenunciasUsuarioPendentes.style.color = "#0F7124";
          } else {
            quantidadeDenunciasUsuarioPendentes.style.color = "#C40303";
          }
          quantidadeDenunciasUsuario.textContent = await contarDenunciasUsuarioAdmin(apelidoDenunciado);
        }
      });

      denunciaRodape.appendChild(botaoAprovarDenuncia);    
    } else {
      botaoAprovarDenuncia.remove();
    }
    
    denunciaRodape.appendChild(botaoIgnorarDenuncia);
    denuncia.appendChild(denunciaRodape);

    // Se for o último elemento da página
    if (i === denunciasUsuario.denuncias.length - 1) {
      const observer = new IntersectionObserver((entries, observerRef) => {
        entries.forEach(async entry => {
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            observerRef.unobserve(entry.target);

            // verifica se ainda há comentários para carregar
            const totalDenunciasUsuario = parseInt(quantidadeDenunciasUsuario.textContent, 10); // Total geral
            const denunciasUsuarioAtuais = denunciasUsuario.denuncias.length; // Comentários na página atual

            if ((paginaDenunciasUsuario * denunciasUsuarioAtuais) < totalDenunciasUsuario) {
              paginaDenunciasUsuario++;
              await exibirDenunciasUsuarioAdmin(apelido, quantidadeDenunciasUsuarioAprovadas, quantidadeDenunciasUsuarioPendentes, quantidadeDenunciasUsuario);
            }
          }
        });
      }, {
        threshold: 1.0 // Só dispara quando 100% visível
      });

      observer.observe(denuncia);
    }

    document.getElementById("listaDenunciasUsuario").appendChild(denuncia);
  }
}

async function capturarDenunciasUsuarioAdmin(apelido, paginaDenunciasUsuario = 1) {
  try {
    const res = await fetch(
      `/admin/capturar-denuncias-usuario/${encodeURIComponent(apelido)}/${encodeURIComponent(paginaDenunciasUsuario)}`
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      await exibirAlertaErro("error", "Erro", "Erro ao buscar denúncias do usuário!");
      throw new Error(errorData.message || "Erro ao buscar denúncias do usuário");
    }

    const data = await res.json();

    return {
      denuncias: data.denuncias,
      totalDenunciasUsuario: data.totalDenunciasUsuario
    };
  } catch (error) {
    console.error(error);
    await exibirAlertaErro("error", "Erro", error.message);
    return { denuncias: [], totalDenunciasUsuario: 0 };
  }
}

async function aprovarDenunciaUsuario(idDenunciaUsuario, apelidoAdmin, apelidoDenunciado) {
  try {
    const res = await fetch('/admin/aprovar-denuncia-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idDenunciaUsuario, apelidoAdmin, apelidoDenunciado }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao aprovar denúncia usuário!");
      throw new Error(data.message || "Erro ao aprovar denúncia usuário");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao aprovar denúncia usuário!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function ignorarDenunciaUsuario(idDenunciaUsuario , apelidoDenunciado) {
  try {
    const res = await fetch('/admin/ignorar-denuncia-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idDenunciaUsuario, apelidoDenunciado }),
    });

    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao ignorar denúncia usuário!");
      throw new Error(data.message || "Erro ao ignorar denúncia usuário");
    }

    return data;

  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao ignorar denúncia usuário!");
    console.error('Erro na requisição: ' + error.message);
  }
}

async function pesquisarUsuariosAdmin(busca, pagina = 1) {
  try {
    const res = await fetch(`/admin/pesquisar-usuarios?busca=${encodeURIComponent(busca)}&pagina=${pagina}`);
    const data = await res.json();

    if (!res.ok) {
      await exibirAlertaErro("error", "Erro", "Erro ao pesquisar usuários!");
      throw new Error(data.message || "Erro ao pesquisar usuários");
    }

    const listaUsuarios = document.getElementById("listaUsuarios");
    const paginacaoUsuarios = document.getElementById("paginacaoUsuarios");

    // Se não tiver nenhum usuário cadastrado
    if (!data.usuarios || data.usuarios.length === 0) {
      listaUsuarios.style.textAlign = "center";
      listaUsuarios.innerHTML = "Nenhum usuário foi encontrado.";

      if (listaUsuarios.classList.contains("active")) {
        listaUsuarios.classList.remove("active");
      }
      paginacaoUsuarios.innerHTML = "";
    } else {
      listaUsuarios.style.textAlign = "left";
      listaUsuarios.innerHTML = "";
      paginacaoUsuarios.innerHTML = "";
      if (!listaUsuarios.classList.contains("active")) {
        listaUsuarios.classList.add("active");
      }

      // Percorre as notícias e renderiza
      for (const usuario of data.usuarios) {
        const usuarioDiv = document.createElement("div");
        usuarioDiv.classList.add("usuario");
  
        const cabecalho = document.createElement("div");
        cabecalho.classList.add("cabecalho");
        cabecalho.appendChild(Object.assign(document.createElement("img"), { src: usuario.fotoPerfil }));

        const ladoDireito = document.createElement("div");
        ladoDireito.appendChild(Object.assign(document.createElement("p"), { textContent: usuario.apelido }));
        
        const dataFormatada = formatarData(usuario.dataCriacao);
        ladoDireito.appendChild(Object.assign(document.createElement("p"), { textContent: `Data de criação: ${dataFormatada}` }));

        cabecalho.appendChild(ladoDireito);
        usuarioDiv.appendChild(cabecalho);

        // Status do perfil
        const statusPerfil = document.createElement("span");
        statusPerfil.textContent = "Status: ";

        const statusP = document.createElement("b");
        if (usuario.desativado == 0) {
          statusP.style.color = "#0F7124";
          statusP.textContent = "Ativo";
        } else {
          statusP.style.color = "#C40303";
          statusP.textContent = "Desativado";
        }

        statusPerfil.appendChild(statusP);
        statusPerfil.appendChild(document.createElement("br"));
        usuarioDiv.appendChild(statusPerfil);

        // Denúncias
        const denunciasAprovadas = document.createElement("span");
        denunciasAprovadas.textContent = "Denúncias aprovadas: ";
        const quantidadeDenunciasUsuarioAprovadas = document.createElement("b");
        quantidadeDenunciasUsuarioAprovadas.textContent = await contarDenunciasUsuarioAprovadasAdmin(usuario.apelido);
        if (quantidadeDenunciasUsuarioAprovadas.textContent == 0) {
          quantidadeDenunciasUsuarioAprovadas.style.color = "#0F7124";
        } else {
          quantidadeDenunciasUsuarioAprovadas.style.color = "#C40303";
        }

        denunciasAprovadas.appendChild(quantidadeDenunciasUsuarioAprovadas);
        denunciasAprovadas.appendChild(document.createElement("br"));
        usuarioDiv.appendChild(denunciasAprovadas);

        const denunciasPendentes = document.createElement("span");
        denunciasPendentes.textContent = "Denúncias pendentes: ";
        const quantidadeDenunciasUsuarioPendentes = document.createElement("b");
        quantidadeDenunciasUsuarioPendentes.textContent = await contarDenunciasUsuarioPendentesAdmin(usuario.apelido);
        if (quantidadeDenunciasUsuarioPendentes.textContent == 0) {
          quantidadeDenunciasUsuarioPendentes.style.color = "#0F7124";
        } else {
          quantidadeDenunciasUsuarioPendentes.style.color = "#C40303";
        }
        denunciasPendentes.appendChild(quantidadeDenunciasUsuarioPendentes);
        denunciasPendentes.appendChild(document.createElement("br"));
        usuarioDiv.appendChild(denunciasPendentes);

        const botaoExibirDenuncias = document.createElement("button");
        botaoExibirDenuncias.classList.add("exibir-denuncias-btn");
        botaoExibirDenuncias.textContent = "Exibir denúncias"

        const denuncias = document.createElement("span");
        const quantidadeDenunciasUsuario = document.createElement("b");
        quantidadeDenunciasUsuario.textContent = await contarDenunciasUsuarioAdmin(usuario.apelido);

        denuncias.appendChild(quantidadeDenunciasUsuario);
        if (quantidadeDenunciasUsuario.textContent == 1) {
          denuncias.appendChild(document.createTextNode(" denúncia"));
        } else {
          denuncias.appendChild(document.createTextNode(" denúncias"));
        }
        denuncias.appendChild(document.createElement("br"));

        botaoExibirDenuncias.addEventListener("click", async (e) => {
          document.getElementById("listaDenunciasUsuario").innerHTML = "";
          exibirModal(modalDenunciasUsuario, e);
          
          if (quantidadeDenunciasUsuario.textContent == 0) {
            document.getElementById("listaDenunciasUsuario").innerHTML = "<p style='margin-top: 15px; text-align: center;'>Este usuário não possui nenhuma denúncia.</p>";
          } else {
            paginaDenunciasUsuario = 1;
            await exibirDenunciasUsuarioAdmin(usuario.apelido, quantidadeDenunciasUsuarioAprovadas, quantidadeDenunciasUsuarioPendentes, quantidadeDenunciasUsuario);
          }
        });

        if (quantidadeDenunciasUsuarioAprovadas.textContent < 3) {
          if (usuario.desativado == 0) {
            // Desativar usuário
            const botaoDesativarUsuario = document.createElement("button");
            botaoDesativarUsuario.classList.add("desativar-usuario-btn");
            botaoDesativarUsuario.textContent = "Desativar usuário";

            botaoDesativarUsuario.addEventListener("click", async (e) => {
              exibirModal(modalDesativarUsuario, e);
              document.getElementById("confirmarDesativarUsuario").dataset.apelido = usuario.apelido;
            });

            usuarioDiv.appendChild(botaoExibirDenuncias);
            usuarioDiv.appendChild(denuncias);
            usuarioDiv.appendChild(botaoDesativarUsuario);
          } else {
            // Ativar usuário
            const botaoAtivarUsuario = document.createElement("button");
            botaoAtivarUsuario.classList.add("ativar-usuario-btn");
            botaoAtivarUsuario.textContent = "Ativar usuário";

            botaoAtivarUsuario.addEventListener("click", async (e) => {
              exibirModal(modalAtivarUsuario, e);
              document.getElementById("confirmarAtivarUsuario").dataset.apelido = usuario.apelido;
            });

            usuarioDiv.appendChild(botaoExibirDenuncias);
            usuarioDiv.appendChild(denuncias);
            usuarioDiv.appendChild(botaoAtivarUsuario);
          }
        } else {
          usuarioDiv.appendChild(botaoExibirDenuncias);
          usuarioDiv.appendChild(denuncias);
        }

        listaUsuarios.appendChild(usuarioDiv);
      }

      // Paginação
      const totalPaginas = Math.ceil(data.totalUsuarios / 10);
      for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
  
        if (i === pagina) {
          btn.disabled = true;
          btn.classList.add("ativo");
        }
      
        btn.onclick = () => {
          document.querySelectorAll("#paginacaoUsuarios button").forEach(b => {
            b.classList.remove("ativo");
            b.disabled = false;
          });
  
          btn.classList.add("ativo");
          btn.disabled = true;
  
          pesquisarUsuariosAdmin(busca, i);
        };
  
        paginacaoUsuarios.appendChild(btn);
      }
    }
  } catch (error) {
    await exibirAlertaErro("error", "Erro", "Erro ao pesquisar usuário!");
    console.error('Erro na requisição: ' + error.message);
  }
}