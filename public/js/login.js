
document.getElementById("LoginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const usuario = {
        email: document.getElementById("email").value.trim(),
        senha: document.getElementById("senha").value.trim()
    };

    const erroMensagem = document.getElementById("erroMensagem");
    erroMensagem.textContent = ''; 

    try {
        const response = await fetch("usuario/login", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario),
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
            erroMensagem.textContent = `${data.message}`;
        } else {
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                erroMensagem.textContent = "Login efetuado com sucesso!";
            }
        }
    } catch (error) {
        erroMensagem.textContent = "Erro ao conectar com o servidor.";
        console.error("Erro:", error);
    }
});
