document.getElementById("cadastroForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const usuario = {
        cd_apelido_usuario: document.getElementById("apelido").value,
        nm_usuario: document.getElementById("nome").value,
        nm_email_usuario: document.getElementById("email").value,
        nm_senha_usuario: document.getElementById("senha").value
    };

    const response = await fetch("usuario/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    const data = await response.json();
    alert(`(${data.statusCode}) ${data.message}`);     
});