document.getElementById("LoginForm").addEventListener("submit", async function(event) {
    event.preventDefault(); 

    const usuario = {
        email: document.getElementById("email").value,
        senha: document.getElementById("senha").value
    };

    try {
        const response = await fetch("usuario/login", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuario),
            credentials: "include"
        });

        const data = await response.json(); 

        alert(`(${data.statusCode}) ${data.message}`);

        if (response.ok) {
            window.location.href = data.redirect; 
        }
    } catch (error) {
        alert("❌ Erro ao conectar com o servidor.");
        console.error("Erro:", error);
    }
});
