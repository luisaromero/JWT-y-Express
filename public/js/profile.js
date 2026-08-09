const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/denegado.html';
} else {
    loadProfile();
}

async function loadProfile() {
    try {
        const res = await fetch('/api/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            localStorage.removeItem('token');
            window.location.href = '/denegado.html';
            return;
        }

        const data = await res.json();
        document.getElementById('email').textContent = `Email: ${data.data.email}`;
        document.getElementById('role').textContent = `Rol: ${data.data.role}`;
    } catch (err) {
        window.location.href = '/denegado.html';
    }
}

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});