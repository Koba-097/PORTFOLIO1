// ===== LOGIN =====
document.addEventListener("DOMContentLoaded", () => {

    const telaLogin = document.getElementById("login");
    const telaPrincipal = document.getElementById("telaPrincipal");
    const btnLogin = document.getElementById("btnLogin");
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");
    const erroLogin = document.getElementById("erro");

    // Se já estiver logado
    if (localStorage.getItem("token")) {
        telaLogin.style.display = "none";
        telaPrincipal.style.display = "block";
        atualizarLista(); // Atualiza lista ao carregar
    }

// ==== REGISTRO ====
const btnRegistrar = document.getElementById("btnRegistrar");
btnRegistrar.addEventListener("click", async () => {
    const email = document.getElementById("registroEmail").value;
    const password = document.getElementById("registroSenha").value;

    if (!email || !password) {
        alert("Preencha email e senha");
        return;
    }

    try {
        const res = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log(data);

        if (res.ok) {
            alert("Usuário registrado com sucesso! Agora faça login.");
        } else {
            alert(data.error || "Erro ao registrar usuário");
        }
    } catch (err) {
        console.error(err);
        alert("Erro de conexão com o servidor");
    }
});

    // Evento do botão entrar
    btnLogin.addEventListener("click", async () => {
        const email = usuarioInput.value;
        const password = senhaInput.value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                erroLogin.innerText = data.error || "Erro desconhecido";
                return;
            }

            // Guarda token
            localStorage.setItem("token", data.token);

            telaLogin.style.display = "none";
            telaPrincipal.style.display = "block";

            atualizarLista(); // Atualiza lista ao logar
        } catch (err) {
            erroLogin.innerText = "Erro ao conectar com servidor";
            console.error(err);
        }
    });
});

// ===== ELEMENTOS PRINCIPAIS =====
const entrada = document.getElementById("nome");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");
const botaoAdicionar = document.getElementById("adicionar");
const botaoLimpar = document.getElementById("limpar");
const inputBusca = document.getElementById("busca");

// ===== ATUALIZAR LISTA =====
async function atualizarLista(filtro = "") {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("/clientes", {
            headers: { "Authorization": "Bearer " + token }
        });

        const clientes = await response.json();

        lista.innerHTML = "";

        clientes.forEach((cliente) => {
            if (!cliente.nome.toLowerCase().includes(filtro.toLowerCase())) return;

            const li = document.createElement("li");

            const span = document.createElement("span");
            span.innerText = cliente.nome;
            span.style.color = "white";

            const btnEditar = document.createElement("button");
            btnEditar.innerHTML = "⚙️";
            btnEditar.classList.add("btn-editar");
            btnEditar.onclick = () => {
                entrada.value = cliente.nome;
                entrada.dataset.editId = cliente.id; // marca id para editar
                entrada.focus();
            };

            const btnRemover = document.createElement("button");
            btnRemover.innerText = "x";
            btnRemover.classList.add("btn-remover");
            btnRemover.onclick = async () => {
                await fetch(`/clientes/${cliente.id}`, {
                    method: "DELETE",
                    headers: { "Authorization": "Bearer " + token }
                });
                atualizarLista(inputBusca.value);
            };

            const divAcoes = document.createElement("div");
            divAcoes.classList.add("acoes-lista");
            divAcoes.appendChild(btnEditar);
            divAcoes.appendChild(btnRemover);

            li.appendChild(span);
            li.appendChild(divAcoes);
            lista.appendChild(li);
        });
    } catch (err) {
        console.error("Erro ao atualizar lista:", err);
    }
}

// ===== ADICIONAR / EDITAR =====
botaoAdicionar.addEventListener("click", async (e) => {
    e.preventDefault();
    const nome = entrada.value.trim();
    const token = localStorage.getItem("token");

    if (!nome) {
        mensagem.innerText = "Digite algo";
        mensagem.className = "erro";
        return;
    }

    const editId = entrada.dataset.editId;

    try {
        if (editId) {
            // Atualizar cliente
            await fetch(`/clientes/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ nome })
            });
            mensagem.innerText = "Editado!";
            mensagem.className = "sucesso";
            delete entrada.dataset.editId;
        } else {
            // Adicionar cliente
            await fetch("/clientes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ nome })
            });
            mensagem.innerText = "Adicionado";
            mensagem.className = "sucesso";
        }

        entrada.value = "";
        atualizarLista(inputBusca.value);
    } catch (err) {
        mensagem.innerText = "Erro ao salvar";
        mensagem.className = "erro";
        console.error(err);
    }
});

// ===== LIMPAR LISTA =====
botaoLimpar.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("/clientes", {
            method: "GET",
            headers: { "Authorization": "Bearer " + token }
        });
        const clientes = await response.json();

        // Deleta todos clientes
        for (const cliente of clientes) {
            await fetch(`/clientes/${cliente.id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
            });
        }

        entrada.value = "";
        atualizarLista();
        mensagem.innerText = "Lista limpa";
        mensagem.className = "sucesso";
    } catch (err) {
        mensagem.innerText = "Erro ao limpar";
        mensagem.className = "erro";
        console.error(err);
    }
});

// ===== BUSCA =====
inputBusca.addEventListener("keyup", () => {
    atualizarLista(inputBusca.value);
});