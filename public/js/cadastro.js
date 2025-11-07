
document.getElementById("cadastroForm").addEventListener("submit", async function(event) {
    event.preventDefault();

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

    const response = await fetch("usuario/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    const data = await response.json();

    if (!response.ok) {
        erroMensagem.textContent = `${data.message}`;
    } else {
        const blobfotoPerfil = await (await fetch("/imagens/iconeUsuarioPadrao.jpg")).blob();

        const formDatafotoPerfil = new FormData();
        formDatafotoPerfil.append("imagem", blobfotoPerfil, "iconeUsuarioPadrao.jpg");
        formDatafotoPerfil.append("apelido", usuario.apelido);
        formDatafotoPerfil.append("idNoticia", null);
        formDatafotoPerfil.append("identificador", "Ícone");

        await fetch("/imagem/upload", {
            method: "POST",
            body: formDatafotoPerfil
        });

        const blobfotoCapa = await (await fetch("/imagens/bannerUsuarioPadrao.jpg")).blob();

        const formDatafotoCapa = new FormData();
        formDatafotoCapa.append("imagem", blobfotoCapa, "bannerUsuarioPadrao.jpg");
        formDatafotoCapa.append("apelido", usuario.apelido);
        formDatafotoCapa.append("idNoticia", null);
        formDatafotoCapa.append("identificador", "Banner");

        await fetch("/imagem/upload", {
            method: "POST",
            body: formDatafotoCapa
        });

        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
            erroMensagem.textContent = 'Cadastro realizado com sucesso!';
        }
    }
});
