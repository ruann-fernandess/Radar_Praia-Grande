document.getElementById("enviarEmail").addEventListener("click", async function() {
    let email = document.getElementById("emailRedefinirSenha").value.trim();
    const erroMensagemRedefinirSenha = document.getElementById("erroMensagemRedefinirSenha");
    erroMensagemRedefinirSenha.textContent = ''; 

    const res = await fetch(
      `usuario/verificar-existencia-email/${encodeURIComponent(email)}`
    );

    const data = await res.json();

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      erroMensagemRedefinirSenha.textContent = "Erro ao verificar existência do e-mail!";
      throw new Error(errorData.message || "Erro ao verificar existência do e-mail");
    }

    if (data.existe) {
        await enviarEmailRedefinirSenha();

        document.getElementById("login").style.display = "none";
        document.getElementById("redefinirSenha").style.display = "none";
        document.getElementById("confirmarEmail").style.display = "block";
    } else {
        erroMensagemRedefinirSenha.textContent = "E-mail não encontrado!";
    }
});

async function enviarEmailRedefinirSenha() {
    const email = document.getElementById("emailRedefinirSenha").value.trim();

    const response = await fetch("usuario/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
        erroMensagem.textContent = `${data.message}`;
    } else {
        document.getElementById("login").style.display = "none";
        document.getElementById("redefinirSenha").style.display = "none";
        document.getElementById("confirmarEmail").style.display = "block";
    }
}

document.getElementById("reenviarEmail").addEventListener("click", async function() {
    await enviarEmailRedefinirSenha();
    document.querySelector("#confirmarEmail p:nth-child(2)").style.display = "block";
});

document.getElementById("exibirRedefinirSenha").addEventListener("click", function() {
    document.getElementById("login").style.display = "none";
    document.getElementById("redefinirSenha").style.display = "block";
    document.getElementById("confirmarEmail").style.display = "none";

    document.getElementById("exibirLogin").style.display = "block";
    document.getElementById("exibirRedefinirSenha").style.display = "none";
});

document.getElementById("exibirLogin").addEventListener("click", function() {
    document.querySelector("#confirmarEmail p:nth-child(2)").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("redefinirSenha").style.display = "none";
    document.getElementById("confirmarEmail").style.display = "none";

    document.getElementById("exibirLogin").style.display = "none";
    document.getElementById("exibirRedefinirSenha").style.display = "block";
});

document.getElementById("voltarRedefinirSenha").addEventListener("click", function() {
    document.querySelector("#confirmarEmail p:nth-child(2)").style.display = "none";
    document.getElementById("login").style.display = "none";
    document.getElementById("confirmarEmail").style.display = "none";
    document.getElementById("redefinirSenha").style.display = "block";
});

document.getElementById("LoginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const usuario = {
        email: document.getElementById("email").value.trim(),
        senha: document.getElementById("senha").value.trim()
    };

    const erroMensagem = document.getElementById("erroMensagem");
    erroMensagem.textContent = ''; 

    try {
        const response = await fetch("/usuario/login", { 
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
