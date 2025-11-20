import { exibirAlertaErro, exibirAlertaErroERedirecionar} from "./alert.js";

const pathParts = window.location.pathname.split('/');
const apelido = pathParts[pathParts.length - 2];
const token = pathParts[pathParts.length - 1];

const titulo = document.querySelector("h1");
const mensagem = document.querySelector("p");
const botoes = document.querySelector(".buttons");

// Validação do token
if (!token) {
    titulo.textContent = "Erro!";
    mensagem.textContent = "Token não fornecido.";
    botoes.innerHTML = "<a href='/index.html' class='btn'>Voltar à página inicial</a>";
} else if (token.length !== 64 || !/^[a-f0-9]{64}$/.test(token)) {
    titulo.textContent = "Erro!";
    mensagem.textContent = "Token inválido.";
    botoes.innerHTML = "<a href='/index.html' class='btn'>Voltar à página inicial</a>";
} else {
    try {
        const res = await fetch(`/token/validar-token-confirmar-cadastro/${encodeURIComponent(token)}`);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            await exibirAlertaErro("error", "Erro", "Erro ao validar token!");
            throw new Error(errorData.message || "Erro ao validar token");
        }

        const data = await res.json();
        titulo.textContent = "Cadastro confirmado!";
        mensagem.textContent = data.message;

        // Upload da imagem de perfil padrão
        const blobfotoPerfil = await(await fetch("/imagens/iconeUsuarioPadrao.jpg")).blob();
        const formDatafotoPerfil = new FormData();
        formDatafotoPerfil.append("imagem", blobfotoPerfil, "iconeUsuarioPadrao.jpg");
        formDatafotoPerfil.append("apelido", apelido);
        formDatafotoPerfil.append("idNoticia", null);
        formDatafotoPerfil.append("identificador", "Ícone");

        await fetch("/imagem/upload", { method: "POST", body: formDatafotoPerfil });

        // Upload da imagem de capa padrão
        const blobfotoCapa = await(await fetch("/imagens/bannerUsuarioPadrao.jpg")).blob();
        const formDatafotoCapa = new FormData();
        formDatafotoCapa.append("imagem", blobfotoCapa, "bannerUsuarioPadrao.jpg");
        formDatafotoCapa.append("apelido", apelido);
        formDatafotoCapa.append("idNoticia", null);
        formDatafotoCapa.append("identificador", "Banner");

        await fetch("/imagem/upload", { method: "POST", body: formDatafotoCapa });

        // Redireciona para a tela de login após 2 segundos
        setTimeout(() => {
            window.location.href = "/login.html";
        }, 2000);
    } catch (error) {
        console.error(error);
        await exibirAlertaErroERedirecionar("error", "Erro", error.message, "/cadastro.html");
    }
}