document.getElementById("reenviarEmail").addEventListener("click", async function() {
    await enviarEmailPreCadastro();
    document.querySelector("#confirmarEmail p:nth-child(2)").style.display = "block";
});

document.getElementById("voltarCadastro").addEventListener("click", function() {
    document.getElementById("cadastro").style.display = "block";
    document.getElementById("confirmarEmail").style.display = "none";
});

document.getElementById("cadastroForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    await enviarEmailPreCadastro();
});

async function enviarEmailPreCadastro() {
    const apelido = document.getElementById("apelido").value.trim().replaceAll(" ", "");
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    const erroMensagem = document.getElementById("erroMensagem");
    erroMensagem.textContent = '';  // Limpa mensagem anterior

    const apelidoValido = /^[a-zA-Z0-9._]+$/.test(apelido);
    const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(senha);

    if (!apelidoValido) {
        erroMensagem.textContent = "O apelido só pode conter letras, números, pontos e sublinhados.";
        return;
    }

    if (!senhaValida) {
        erroMensagem.textContent = "A senha deve ter pelo menos 8 caracteres, incluindo ao menos uma letra e um número.";
        return;
    }

    const usuario = { apelido, nome, email, senha };

    const response = await fetch("usuario/pre-cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    const data = await response.json();

    if (!response.ok) {
        erroMensagem.textContent = `${data.message}`;
    } else {
        document.getElementById("cadastro").style.display = "none";
        document.getElementById("confirmarEmail").style.display = "block";
    }
}