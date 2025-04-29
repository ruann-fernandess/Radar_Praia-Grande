document.addEventListener("DOMContentLoaded", () => {
    const apelidoSpan = document.getElementById("apelido");
    const emailSpan = document.getElementById("email");
    const nomeSpan = document.getElementById("nome");
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
        emailSpan.textContent = data.email;
        nomeSpan.textContent = data.nome;
        fotoPerfilImg.src = data.fotoPerfil;
        fotoCapaImg.src = data.fotoCapa;
        biografiaSpan.textContent = data.biografia;
      })
      .catch((err) => {
        console.error("❌ Erro ao carregar perfil:", err.message);
        alert(err.message);
        window.location.href = "/login.html";
      });
    });