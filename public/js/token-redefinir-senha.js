import { exibirAlertaErro, exibirAlertaErroERedirecionar} from "./alert.js";

const pathParts = window.location.pathname.split('/');
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
        const res = await fetch(`/token/validar-token-redefinir-senha/${encodeURIComponent(token)}`);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            await exibirAlertaErro("error", "Erro", "Erro ao validar token!");
            throw new Error(errorData.message || "Erro ao validar token");
        }

        const data = await res.json();

        titulo.textContent = "Redefinir senha!";
        mensagem.textContent = "Agora você pode redefinir sua senha. Insira a nova senha no campo abaixo e confirme para concluir o processo com segurança.";        
    } catch (error) {
        console.error(error);
        await exibirAlertaErroERedirecionar("error", "Erro", error.message, "/cadastro.html");
    }

    document.getElementById("confirmarRedefinirSenha").addEventListener("click", async function() {
        const senha = document.getElementById("senha").value.trim();
        const erroMensagem = document.getElementById("erroMensagem");
        erroMensagem.textContent = '';

        const senhaValida = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(senha);
        if (!senhaValida) {
            erroMensagem.textContent = "A senha deve ter pelo menos 8 caracteres, incluindo ao menos uma letra e um número.";
            return;
        }

        const response = await fetch("/usuario/atualizar-senha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({token, senha})
        });

        const data = await response.json();
        
        if (!response.ok) {
            erroMensagem.textContent = `${data.message}`;
        } else {
            document.getElementById("redefinirSenha").style.display = "none";    
            titulo.textContent = "Senha atualizada!";
            mensagem.textContent = data.message;

            setTimeout(() => {
                window.location.href = "/login.html";
            }, 2000);

        }
    });
}