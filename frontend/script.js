// ================= FUNÇÕES AUX =================//
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

const cookieToken = getCookie('auth_token');
if (cookieToken) {
    localStorage.setItem("token", cookieToken);
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// ================= INTERFACE =================//
document.addEventListener("DOMContentLoaded", () => {

const menuIcon = document.getElementById('menuIcon');
const menuDropdown = document.getElementById('menuDropdown');

if (menuIcon && menuDropdown) {
    menuIcon.addEventListener('click', () => {
        menuDropdown.classList.toggle('show');
    });
}

    const telaLogin = document.getElementById("login");
    const telaPrincipal = document.getElementById("telaPrincipal");
    const btnLogin = document.getElementById("btnLogin");
    const btnRegistrar = document.getElementById("btnRegistrar");
    const btnLogout = document.getElementById("btnLogout");

    const verificarAcesso = () => {
        const token = localStorage.getItem("token");
        if (token) {
            telaLogin.style.display = "none";
            telaPrincipal.style.display = "block";
            atualizarLista();
        } else {
            telaLogin.style.display = "block";
            telaPrincipal.style.display = "none";
        }
    };

    verificarAcesso();

    if (btnLogin) {
        btnLogin.onclick = async () => {
            const email = document.getElementById("usuario").value;
            const password = document.getElementById("senha").value;

            const res = await fetch("/auth/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) return alert(data.error);

            localStorage.setItem("token", data.token);
            verificarAcesso();
        };
    }

    if (btnRegistrar) {
        btnRegistrar.onclick = async () => {
            const email = document.getElementById("registroEmail").value;
            const password = document.getElementById("registroSenha").value;

            await fetch("/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ email, password })
            });

            alert("Registrado!");
        };
    }

    if (btnLogout) {
        btnLogout.onclick = () => {
            localStorage.removeItem("token");
            window.location.reload();
        };
    }

    const dataInput = document.getElementById("dataAgendamento");
    if (dataInput) {
        dataInput.addEventListener("change", atualizarHorarios);
    }
});

// ================= CLIENTES =================
const entrada = document.getElementById("nome");
const lista = document.getElementById("lista");

async function atualizarLista() {
    const token = localStorage.getItem("token");

    const res = await fetch("/clientes", {
        headers: { Authorization: "Bearer " + token }
    });

    const clientes = await res.json();

    lista.innerHTML = "";
    clientes.forEach(c => {
        const li = document.createElement("li");
        li.innerText = c.nome;
        lista.appendChild(li);
    });
}

// ================= AGENDAMENTO =================
async function criarAgendamento() {
    const token = localStorage.getItem("token");

    const data = document.getElementById("dataAgendamento").value;
    const hora = document.getElementById("horaAgendamento").value;

    const res = await fetch("/agendamentos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            cliente_id: 1,
            data,
            hora
        })
    });

    const dataRes = await res.json();

    if (!res.ok) return alert(dataRes.error);

    alert("Agendado!");
    atualizarHorarios();
}

async function atualizarHorarios() {
    const token = localStorage.getItem("token");
    const data = document.getElementById("dataAgendamento").value;
    const select = document.getElementById("horaAgendamento");

    const res = await fetch(`/agendamentos?data=${data}`, {
        headers: { Authorization: "Bearer " + token }
    });

    const ocupados = await res.json();
    const horasOcupadas = ocupados.map(a => a.hora);

    Array.from(select.options).forEach(opt => {
        if (horasOcupadas.includes(opt.value)) {
            opt.disabled = true;
            opt.textContent = opt.value + " (ocupado)";
        } else {
            opt.disabled = false;
            opt.textContent = opt.value;
        }
    });
}


// ===== FUNDO COM BOLHAS PIXEL =====
function criarBolha() {
    const bg = document.querySelector(".background");
    if (!bg) return;

    const bolha = document.createElement("div");

    const tamanhos = ["small", "medium", "large"];
    bolha.classList.add("particula");
    bolha.classList.add(tamanhos[Math.floor(Math.random() * tamanhos.length)]);

    bolha.style.left = Math.random() * 100 + "vw";

    const duracao = Math.random() * 5 + 5;
    bolha.style.animationDuration = duracao + "s";

    bg.appendChild(bolha);

    setTimeout(() => bolha.remove(), duracao * 4000);
}

// spawn contínuo
setInterval(criarBolha, 200);

// ===== FOGUEIRA (PARTÍCULAS) =====
window.addEventListener("load", () => {

    function criarParticula() {
        const bg = document.querySelector(".background");
        if (!bg) return;

        const p = document.createElement("div");

        const tamanhos = ["small", "medium", "large"];
        p.classList.add("particula");
        p.classList.add(tamanhos[Math.floor(Math.random() * tamanhos.length)]);

        const cores = [
            "#ff00ff",
            "#ff4500",
            "#ff2200",
            "#ff8800"
        ];

        const cor = cores[Math.floor(Math.random() * cores.length)];

        p.style.background = cor;
        p.style.color = cor;

        p.style.left = Math.random() * 100 + "vw";

        const duracao = Math.random() * 6 + 6;
        p.style.animationDuration = duracao + "s";

        bg.appendChild(p);

        setTimeout(() => p.remove(), duracao * 1000);
    }

    setInterval(criarParticula, 120);
});

// ===== OLHO DA SENHA =====
function toggleSenha() {
    const senha = document.getElementById("registroSenha");
    const botao = document.getElementById("verSenha");

    if (!senha || !botao) return;

    if (senha.type === "password") {
        senha.type = "text";
        botao.classList.add("olho-ativo");
    } else {
        senha.type = "password";
        botao.classList.remove("olho-ativo");
    }
}