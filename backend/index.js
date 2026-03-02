const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { open } = require('sqlite');
const os = require('os');

const app = express();
const PORT = 3000;
const SECRET = "superSegredo123";

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

let db;

// ================= MIDDLEWARE =================
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Sem token" });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        console.log("Usuário logado:", decoded.id); // DEBUG
        req.userId = decoded.id;
        next();
    } catch (err) {
        console.error("Token inválido:", err);
        return res.status(401).json({ error: "Token inválido" });
    }
}

// ================= INICIALIZAÇÃO =================
async function start() {
    db = await open({
        filename: path.resolve('./database.db'),
        driver: sqlite3.Database
    });


    // Criar tabela users
    await db.exec(
        "CREATE TABLE IF NOT EXISTS users (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "email TEXT UNIQUE NOT NULL, " +
        "password TEXT NOT NULL" +
        ");"
    );

// Abre o banco
db = await open({
    filename: path.resolve('./database.db'),
    driver: sqlite3.Database
});

// Adiciona a coluna owner_id se não existir
try {
    await db.exec("ALTER TABLE clientes ADD COLUMN owner_id INTEGER");
} catch (err) {
    // Se a coluna já existir, ignora o erro
    console.log("Coluna owner_id já existe ou erro ao criar:", err.message);
}

    // Criar tabela clientes
    await db.exec(
        "CREATE TABLE IF NOT EXISTS clientes (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "nome TEXT NOT NULL, " +
        "owner_id INTEGER, " +
        "FOREIGN KEY (owner_id) REFERENCES users(id)" +
        ");"
    );

    console.log("Banco conectado com sucesso.");

    // ================= ROTAS =================

    // Perfil
    app.get('/profile', authMiddleware, (req, res) => {
        res.json({ message: "Logado", userId: req.userId });
    });

    // Listar clientes do usuário logado
    app.get('/clientes', authMiddleware, async function (req, res) {
    try {
        const clientes = await db.all(
            "SELECT * FROM clientes WHERE owner_id = ?",
            [req.userId]
        );
        res.json(clientes);
    } catch (err) {
        console.error("Erro no GET /clientes:", err);
        res.status(500).json({ error: "Erro ao buscar clientes" });
    }
});

    // Criar cliente
    app.post('/clientes', authMiddleware, async (req, res) => {
        const nome = req.body.nome;
        if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });

        await db.run("INSERT INTO clientes (nome, owner_id) VALUES (?, ?)", [nome, req.userId]);
        res.json({ message: "Cliente criado com sucesso" });
    });

    // Editar cliente
    app.put('/clientes/:id', authMiddleware, async (req, res) => {
        const id = req.params.id;
        const nome = req.body.nome;

        if (!nome) return res.status(400).json({ error: "Nome é obrigatório" });

        await db.run("UPDATE clientes SET nome = ? WHERE id = ? AND owner_id = ?", [nome, id, req.userId]);
        res.json({ message: "Cliente atualizado com sucesso" });
    });

    // Remover cliente
    app.delete('/clientes/:id', authMiddleware, async (req, res) => {
        const id = req.params.id;
        await db.run("DELETE FROM clientes WHERE id = ? AND owner_id = ?", [id, req.userId]);
        res.json({ message: "Cliente removido com sucesso" });
    });

// Deletar cliente
app.delete('/clientes/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.run(
            "DELETE FROM clientes WHERE id = ? AND owner_id = ?",
            [id, req.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }

        res.json({ message: "Cliente deletado com sucesso" });
    } catch (err) {
        res.status(500).json({ error: "Erro ao deletar cliente" });
    }
});

    // Registrar usuário
    app.post('/register', async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        if (!email || !password) return res.status(400).json({ error: "Preencha tudo" });

        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            await db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);
            res.json({ message: "Usuário criado com sucesso" });
        } catch {
            res.status(400).json({ error: "Email já existente" });
        }
    });

    // Login
    app.post('/login', async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Senha inválida" });

        const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1d' });
        res.json({ token });
    });

    // ================= SERVIDOR =================
    app.listen(PORT, '0.0.0.0', () => {
        const interfaces = os.networkInterfaces();
        let ipLocal = 'localhost';

        for (let nome in interfaces) {
            for (const iface of interfaces[nome]) {
                if (iface.family === 'IPv4' && !iface.internal) ipLocal = iface.address;
            }
        }

        console.log("🚀 SERVIDOR RODANDO");
        console.log("No PC: http://localhost:" + PORT);
        console.log("No Celular: http://" + ipLocal + ":" + PORT);
    });
}

start();