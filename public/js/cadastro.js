document.getElementById("cadastroForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const usuario = {
        apelido: document.getElementById("apelido").value,
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };

    const response = await fetch("usuario/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario)
    });

    const data = await response.json();
    alert(`(${data.statusCode}) ${data.message}`); 

    if (data.redirect) {
        window.location.href = data.redirect;  
    }
});
