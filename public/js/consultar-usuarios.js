const dropdown = document.querySelector(".dropdown");
const linkDropdown = document.getElementById("dropdown-link");

linkDropdown.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("active");
});

// Fechar dropdown ao clicar fora
document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
    }
});