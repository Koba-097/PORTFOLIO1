// ===== AS SUAS FUNÇÕES ORIGINAIS (MANTIDAS) =====
document.addEventListener("DOMContentLoaded", () => {
    const telaLogin = document.getElementById("login");
    const telaPrincipal = document.getElementById("telaPrincipal");
    const btnLogin = document.getElementById("btnLogin");
    const usuarioInput = document.getElementById("usuario");
    const senhaInput = document.getElementById("senha");
    const erroLogin = document.getElementById("erro");

    if (localStorage.getItem("token")) {
        telaLogin.style.display = "none";
        telaPrincipal.style.display = "block";
        atualizarLista();
    }

    const btnRegistrar = document.getElementById("btnRegistrar");
    btnRegistrar.addEventListener("click", async () => {
        const email = document.getElementById("registroEmail").value;
        const password = document.getElementById("registroSenha").value;
        if (!email || !password) { alert("Preencha email e senha"); return; }
        try {
            const res = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) { alert("Usuário registrado com sucesso! Agora faça login."); }
            else { alert(data.error || "Erro ao registrar usuário"); }
        } catch (err) { console.error(err); alert("Erro de conexão"); }
    });

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
            if (!response.ok) { erroLogin.innerText = data.error || "Erro"; return; }
            localStorage.setItem("token", data.token);
            telaLogin.style.display = "none";
            telaPrincipal.style.display = "block";
            atualizarLista();
        } catch (err) { erroLogin.innerText = "Erro ao conectar"; }
    });
});

// ... suas outras consts (entrada, lista, botaoAdicionar ...)
const btnSair = document.getElementById("btnSair"); // Pode ficar aqui embaixo das outras!

// Lógica do Logout
if (btnSair) {
    btnSair.addEventListener("click", () => {
        localStorage.removeItem("token");
        // Como é uma landing page, o reload garante que ele volte
        // para o estado inicial (tela de login aparecendo)
        window.location.reload();
    });
}

const entrada = document.getElementById("nome");
const lista = document.getElementById("lista");
const mensagem = document.getElementById("mensagem");
const botaoAdicionar = document.getElementById("adicionar");
const botaoLimpar = document.getElementById("limpar");
const inputBusca = document.getElementById("busca");

// ===== ONDE A ENGRENAGEM VOLTA (FOCO AQUI) =====
async function atualizarLista(filtro = "") {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch("/clientes", {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.ok) return;
        const clientes = await response.json();

        lista.innerHTML = "";

        clientes.forEach((cliente) => {
            if (!cliente.nome.toLowerCase().includes(filtro.toLowerCase())) return;

            const li = document.createElement("li");
            const span = document.createElement("span");
            span.innerText = cliente.nome;
            span.style.color = "white";

            // Criando a div de ações que o seu CSS usa (.acoes-lista)
            const divAcoes = document.createElement("div");
            divAcoes.className = "acoes-lista";

            // Criando a engrenagem que seu CSS faz girar (.btn-editar)
            const btnEditar = document.createElement("button");
            btnEditar.className = "btn-editar";
            btnEditar.innerHTML = "⚙️";
            btnEditar.onclick = () => {
                entrada.value = cliente.nome;
                entrada.dataset.editId = cliente.id;
                entrada.focus();
                mensagem.innerText = "Editando...";
            };

            const btnRemover = document.createElement("button");
            btnRemover.className = "btn-remover";
            btnRemover.innerText = "X";
            btnRemover.onclick = async () => {
                if (confirm("Excluir?")) {
                    await fetch(`/clientes/${cliente.id}`, {
                        method: "DELETE",
                        headers: { "Authorization": "Bearer " + token }
                    });
                    atualizarLista();
                }
            };

            divAcoes.appendChild(btnEditar);
            divAcoes.appendChild(btnRemover);
            li.appendChild(span);
            li.appendChild(divAcoes);
            lista.appendChild(li);
        });
    } catch (err) { console.error(err); }
}

// frontend/script.js
//BOTAO LOGOUT
// Lógica para o botão de Sair funcionar
document.addEventListener('DOMContentLoaded', () => {
    const btnSair = document.getElementById('btnLogout');

    if (btnSair) {
        btnSair.onclick = function() {
            // 1. Remove o token (limpa o "crachá")
            localStorage.removeItem('token');

            // 2. Esconde a tela de clientes e mostra a de login novamente
            document.getElementById('telaPrincipal').style.display = 'none';
            document.getElementById('login').style.display = 'block';

            // 3. Opcional: Limpa as mensagens de erro ou sucesso
            document.getElementById('mensagem').innerText = "";
            document.getElementById('erro').innerText = "";

            console.log("Logout realizado com sucesso!");
        };
    }
});

// ===== ADICIONAR / EDITAR =====
botaoAdicionar.addEventListener("click", async (e) => {
    e.preventDefault();
    const nome = entrada.value.trim();
    const token = localStorage.getItem("token");
    if (!nome) { mensagem.innerText = "Digite algo"; return; }

    const editId = entrada.dataset.editId;
    try {
        const method = editId ? "PUT" : "POST";
        const url = editId ? `/clientes/${editId}` : "/clientes";

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify({ nome })
        });

        delete entrada.dataset.editId;
        entrada.value = "";
        mensagem.innerText = editId ? "Editado!" : "Adicionado!";
        mensagem.className = "sucesso";
        atualizarLista(inputBusca.value);
    } catch (err) { console.error(err); }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menuIcon');
    const menuDropdown = document.getElementById('menuDropdown');
    const btnSair = document.getElementById('btnLogout');

    // 1. Lógica para abrir/fechar o menu ao clicar nas barrinhas
    if (menuIcon) {
        menuIcon.addEventListener('click', () => {
            menuDropdown.classList.toggle('show');
        });
    }

    // 2. Lógica do Logout (Sair)
    if (btnSair) {
        btnSair.onclick = function() {
            localStorage.removeItem('token');
            // Esconde o sistema e volta pro login
            document.getElementById('telaPrincipal').style.display = 'none';
            document.getElementById('login').style.display = 'block';
            // Fecha o menu para a próxima vez
            menuDropdown.classList.remove('show');
        };
    }

    // Fecha o menu se clicar fora dele
    window.onclick = function(event) {
        if (!event.target.matches('.menu-icon') && !event.target.parentElement.matches('.menu-icon')) {
            if (menuDropdown.classList.contains('show')) {
                menuDropdown.classList.remove('show');
            }
        }
    }
});

// ===== LIMPAR LISTA =====
botaoLimpar.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("/clientes", { headers: { "Authorization": "Bearer " + token }});
        const clis = await res.json();
        for (const c of clis) {
            await fetch(`/clientes/${c.id}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token }});
        }
        atualizarLista();
    } catch (err) { console.error(err); }
});

inputBusca.addEventListener("keyup", () => atualizarLista(inputBusca.value));

const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    // 1. MOVIMENTAÇÃO DO CÍRCULO (CURSOR CUSTOM)
    // Usamos pageX/Y para ele não travar no scroll
    if (cursor) {
        window.requestAnimationFrame(() => {
            cursor.style.left = e.pageX + 'px';
            cursor.style.top = e.pageY + 'px';
        });
    }

    // 2. CRIAÇÃO DA PURPURINA
    const purpurina = document.createElement('div');
    purpurina.className = 'purpurina';

    purpurina.style.left = e.pageX + 'px';
    purpurina.style.top = e.pageY + 'px';

    const tamanho = Math.random() * 8 + 2 + 'px';
    purpurina.style.width = tamanho;
    purpurina.style.height = tamanho;

    document.body.appendChild(purpurina);

    // Remove a partícula para não pesar
    setTimeout(() => {
        purpurina.remove();
    }, 1000);
});

// 3. EFEITOS DE CLIQUE (MANTIDOS)
document.addEventListener('mousedown', () => {
    if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
});

document.addEventListener('mouseup', () => {
    if (cursor) cursor.style.transform = 'translate(-50%, -50%) scale(1)';
});

// ===== SEU OLHO DE SENHA ORIGINAL (MANTIDO) =====
function toggleSenha(){
    const senha = document.getElementById("registroSenha");
    const botao = document.getElementById("verSenha");
    if(senha && senha.type === "password"){
        senha.type = "text";
        botao.classList.add("olho-ativo");
    } else if (senha) {
        senha.type = "password";
        botao.classList.remove("olho-ativo");
    }
}
// ===== SEU OLHO DE SENHA ORIGINAL (MANTIDO) =====
function toggleSenha(){
    const senha = document.getElementById("registroSenha");
    const botao = document.getElementById("verSenha");
    if(senha.type === "password"){
        senha.type = "text";
        botao.classList.add("olho-ativo");
    }else{
        senha.type = "password";
        botao.classList.remove("olho-ativo");
    }
}