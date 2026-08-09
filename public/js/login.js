const btnLogin = document.getElementById("btnLogin");
const btnPerfil = document.getElementById("btnProfile");
const respuestaDiv = document.getElementById("response");

function showResponse(texto, esOk) {
    respuestaDiv.textContent = texto;
    respuestaDiv.className = esOk ? "ok" : "error";
    respuestaDiv.style.display = "block";
}

btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            showResponse(`Login exitoso · ${res.status} OK`, true);
        } else {
            showResponse(`${data.mensaje} · ${res.status}`, false);
        }
    } catch (err) {
        showResponse("No se pudo conectar con el servidor", false);
    }
});

btnPerfil.addEventListener("click", () => {
    window.location.href = "/perfil.html";
});