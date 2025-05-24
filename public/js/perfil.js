document.addEventListener("DOMContentLoaded", () => {
  const apelidoSpan = document.getElementById("apelido");
  const fotoPerfilImg = document.getElementById("fotoPerfil");
  const fotoCapaImg = document.getElementById("fotoCapa");
  const biografiaSpan = document.getElementById("biografia");

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
      apelidoSpan.textContent = data.apelido;
      fotoPerfilImg.src = data.fotoPerfil;
      fotoCapaImg.src = data.fotoCapa;
      biografiaSpan.textContent = data.biografia;
    })
    .catch((err) => {
      console.error("❌ Erro ao carregar perfil:", err.message);
      alert(err.message);
      window.location.href = "/login.html";
    });

  const modal = document.getElementById("confirmModal");
  const logoutBtn = document.getElementById("logout-btn");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "block";
  });

  confirmNo.addEventListener("click", () => {
    modal.style.display = "none";
  });

  confirmYes.addEventListener("click", async () => {
    try {
      const resposta = await fetch("/usuario/logout", {
        method: "GET",
        credentials: "include"
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert(resultado.message);
        window.location.href = resultado.redirect;
      } else {
        alert("Erro ao fazer logout: " + resultado.message);
        modal.style.display = "none";
      }
    } catch (err) {
      console.error("Erro na requisição de logout:", err);
      alert("Erro inesperado no logout.");
      modal.style.display = "none";
    }
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});
