import Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// Função exportada para gerar token
export async function gerarToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Função genérica que envia e-mail pelo Brevo
export async function enviarEmailBrevo({ to, subject, html }) {
  try {
    const email = {
      sender: {
        email: "radarpraiagrande2025@gmail.com",
        name: "Radar Praia Grande"
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    };

    const result = await apiInstance.sendTransacEmail(email);
    return result;
  } catch (error) {
    console.error("Erro ao enviar e-mail pelo Brevo:", error);
    throw error;
  }
}

// Conteúdo do e-mail de confirmação de cadastro
export async function gerarConteudoEmailConfirmarCadastro(email, token, apelido) {
  return {
    to: email,
    subject: "Confirme seu cadastro",
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Cadastro - Radar Praia Grande</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Young+Serif&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Young Serif', serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .header {
            background-color: #9c6644;
            color: #ede0d4;
            text-align: center;
            padding: 20px 0;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
          }
          .content a {
            display: inline-block;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #9c6644;
            color: #ede0d4;
            text-decoration: none;
            border-radius: 5px;
          }
          .content a:hover {
            opacity: 0.9;
          }
          .footer {
            background-color: #f2f2f2;
            color: #666666;
            text-align: center;
            padding: 15px 0;
            font-size: 12px;
          }
          .note {
            font-size: 14px;
            color: #555555;
          }
        </style>
      </head>
      <body>
        <div class="header">
          Radar Praia Grande
        </div>

        <div class="content">
          <h2>Confirmação de cadastro</h2>
          <p>Olá ${apelido}, para ativar sua conta clique no link abaixo:</p>
          <a href="http://localhost:8080/tokens/token-confirmar-cadastro/${apelido}/${token}">
            Confirmar cadastro
          </a>
          <p class="note">Este link expira em 1 hora.</p>
          <p>Se você não fez este cadastro, ignore este e-mail.</p>
        </div>

        <div class="footer">
          &copy; 2025 Radar Praia Grande. Todos os direitos reservados.
        </div>
      </body>
      </html>
    `
  };
}

// Conteúdo do e-mail de redefinição de senha
export async function gerarConteudoEmailRedefinirSenha(email, token) {
  return {
    to: email,
    subject: "Redefinição de senha",
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinição de Senha - Radar Praia Grande</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Young+Serif&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Young Serif', serif;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .header {
            background-color: #9c6644;
            color: #ede0d4;
            text-align: center;
            padding: 20px 0;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 20px;
            line-height: 1.6;
          }
          .content a {
            display: inline-block;
            margin: 15px 0;
            padding: 10px 20px;
            background-color: #9c6644;
            color: #ede0d4;
            text-decoration: none;
            border-radius: 5px;
          }
          .content a:hover {
            opacity: 0.9;
          }
          .footer {
            background-color: #f2f2f2;
            color: #666666;
            text-align: center;
            padding: 15px 0;
            font-size: 12px;
          }
          .note {
            font-size: 14px;
            color: #555555;
          }
        </style>
      </head>
      <body>
        <div class="header">
          Radar Praia Grande
        </div>

        <div class="content">
          <h2>Redefinição de senha</h2>
          <p>Para redefinir sua senha clique no link abaixo:</p>
          <a href="http://localhost:8080/tokens/token-redefinir-senha/${token}">
            Redefinir senha
          </a>
          <p class="note">Este link expira em 1 hora.</p>
          <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
        </div>

        <div class="footer">
          &copy; 2025 Radar Praia Grande. Todos os direitos reservados.
        </div>
      </body>
      </html>
    `
  };
}
