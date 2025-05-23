document.getElementById("cadastroForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const usuario = {
        apelido: document.getElementById("apelido").value,
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };

    const erroMensagem = document.getElementById("erroMensagem");
    erroMensagem.textContent = '';  // limpa mensagem antes

    const response = await fetch("usuario/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    const data = await response.json();

    if (!response.ok) {
        erroMensagem.textContent = `${data.message}`;
    } else {
        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
            erroMensagem.textContent = 'Cadastro realizado com sucesso!';
        }
    }
});
