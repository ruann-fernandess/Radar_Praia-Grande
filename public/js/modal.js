const modalLogout = document.getElementById("confirmModal");
const logoutBtns = document.querySelectorAll(".logout-btn");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

const modalNoticia = document.getElementById("noticiaModal");
const modalComentarios = document.getElementById("comentariosModal");
const modalAdicionarComentario = document.getElementById("adicionarComentarioModal");
const modalEditarComentario = document.getElementById("editarComentarioModal");

const modalDenunciarNoticia = document.getElementById("denunciarNoticiaModal");
const modalDenunciarComentario = document.getElementById("denunciarComentarioModal");
const modalDenunciarUsuario = document.getElementById("denunciarUsuarioModal");

const modalSeguidores = document.getElementById("seguidoresModal");
const modalSeguindo = document.getElementById("seguindoModal");

const modalDenunciasUsuario = document.getElementById("denunciasUsuarioModal");
const modalDenunciasNoticia = document.getElementById("denunciasNoticiaModal");
const modalDenunciasComentario = document.getElementById("denunciasComentarioModal");

const modalDesativarUsuario = document.getElementById("desativarUsuarioModal");
const modalAtivarUsuario = document.getElementById("ativarUsuarioModal");
const modalDesativarNoticia = document.getElementById("desativarNoticiaModal");
const modalAtivarNoticia = document.getElementById("ativarNoticiaModal");
const modalExcluirComentario = document.getElementById("excluirComentarioModal");

const modalCadastroLogin = document.getElementById("cadastroLoginModal");

export function exibirModal(modal, e) {
  e.preventDefault();
  modal.style.display = "block";
}

export function esconderModal(modal) {
  modal.style.display = "none";
}

logoutBtns.forEach(btn => {
  btn.addEventListener("click", (e) => {
    exibirModal(modalLogout, e);
  });
});

confirmNo.addEventListener("click", () => {
  esconderModal(modalLogout);
});

confirmYes.addEventListener("click", async () => {
  try {
    const resposta = await fetch("/usuario/logout", {
      method: "GET",
      credentials: "include"
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      window.location.href = resultado.redirect;
    } else {
      await exibirAlertaErro("error", "Erro", resultado.message);
      esconderModal(modalLogout);
    }
  } catch (err) {
    console.error("Erro na requisição de logout:", err);
    await exibirAlertaErro("error", "Erro", resultado.message);
    esconderModal(modalLogout);
  }
});

window.addEventListener("click", (event) => {
  if (event.target === modalLogout) {
    esconderModal(modalLogout);
  }
  if (event.target === modalComentarios) {
    esconderModal(modalComentarios);
  }
  if (event.target === modalAdicionarComentario) {
    esconderModal(modalAdicionarComentario);
  }
  if (event.target === modalEditarComentario) {
    esconderModal(modalEditarComentario);
  }
  if (event.target === modalDenunciarNoticia) {
    esconderModal(modalDenunciarNoticia);
  }
  if (event.target === modalDenunciarComentario) {
    esconderModal(modalDenunciarComentario);
  }
  if (event.target === modalDenunciarUsuario) {
    esconderModal(modalDenunciarUsuario);
  }
  if (event.target === modalSeguidores) {
    esconderModal(modalSeguidores);
  }
  if (event.target === modalSeguindo) {
    esconderModal(modalSeguindo);
  }
  if (event.target === modalDenunciasUsuario) {
    esconderModal(modalDenunciasUsuario);
  }
  if (event.target === modalDenunciasNoticia) {
    esconderModal(modalDenunciasNoticia);
  }
  if (event.target === modalDenunciasComentario) {
    esconderModal(modalDenunciasComentario);
  }
  if (event.target === modalDesativarUsuario) {
    esconderModal(modalDesativarUsuario);
  }
  if (event.target === modalAtivarUsuario) {
    esconderModal(modalAtivarUsuario);
  }
  if (event.target === modalDesativarNoticia) {
    esconderModal(modalDesativarNoticia);
  }
  if (event.target === modalAtivarNoticia) {
    esconderModal(modalAtivarNoticia);
  }
  if (event.target === modalExcluirComentario) {
    esconderModal(modalExcluirComentario);
  }
  if (event.target === modalNoticia) {
    esconderModal(modalNoticia);
  }
  if (event.target === modalCadastroLogin) {
    esconderModal(modalCadastroLogin);
  }
});