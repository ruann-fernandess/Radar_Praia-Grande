
document.getElementById("cadastroForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const usuario = {
        apelido: document.getElementById("apelido").value.trim().replaceAll(" ", ""),
        nome: document.getElementById("nome").value.trim(),
        email: document.getElementById("email").value.trim(),
        senha: document.getElementById("senha").value.trim()
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
        const blobfotoPerfil = await (await fetch("/imagens/iconeUsuarioPadrao.jpg")).blob();

        const formDatafotoPerfil = new FormData();
        formDatafotoPerfil.append("imagem", blobfotoPerfil, "iconeUsuarioPadrao.jpg"); // 👈 nome tem que ser "imagem"
        formDatafotoPerfil.append("apelido", usuario.apelido);
        formDatafotoPerfil.append("idNoticia", null);
        formDatafotoPerfil.append("identificador", "Ícone");

        await fetch("/imagem/upload", {
            method: "POST",
            body: formDatafotoPerfil
        });

        const blobfotoCapa = await (await fetch("/imagens/bannerUsuarioPadrao.jpg")).blob();

        const formDatafotoCapa = new FormData();
        formDatafotoCapa.append("imagem", blobfotoCapa, "bannerUsuarioPadrao.jpg"); // 👈 nome tem que ser "imagem"
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
