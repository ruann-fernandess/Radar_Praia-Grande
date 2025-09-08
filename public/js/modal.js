const modalLogout = document.getElementById("confirmModal");
const logoutBtn = document.getElementById("logout-btn");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");

const modalComentarios = document.getElementById("comentariosModal");
const modalAdicionarComentario = document.getElementById("adicionarComentarioModal");

const modalEditarComentario = document.getElementById("editarComentarioModal");

export function exibirModal(modal, e) {
  e.preventDefault();
  modal.style.display = "block";
}

export function esconderModal(modal) {
  modal.style.display = "none";
}

logoutBtn.addEventListener("click", (e) => {
  exibirModal(modalLogout, e);
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
});