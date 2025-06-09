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
          window.location.href = resultado.redirect;
        } else {
          await exibirAlertaErro("error", "Erro", resultado.message);
          modal.style.display = "none";
        }
      } catch (err) {
        console.error("Erro na requisição de logout:", err);
        await exibirAlertaErro("error", "Erro", resultado.message);
        modal.style.display = "none";
      }
    });
 
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
