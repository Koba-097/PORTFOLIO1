const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let db;

async function connectDatabase() {
    db = await open({
        filename: path.resolve("./database.db"),
        driver: sqlite3.Database
    });

    // tabela de usuários
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    `);

    // tabela de clientes
    await db.exec(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            owner_id INTEGER,
            FOREIGN KEY (owner_id) REFERENCES users(id)
        );
    `);

    // tenta adicionar coluna email
    try {
        await db.exec(`ALTER TABLE clientes ADD COLUMN email TEXT`);
        console.log("Coluna email adicionada na tabela clientes.");
    } catch (error) {
        if (error.message.includes("duplicate column name")) {
            console.log("Coluna email já existe.");
        } else {
            console.error("Erro ao alterar tabela:", error);
        }
    }

    console.log("Banco conectado com sucesso.");
}

function getDb() {
    return db;
}

module.exports = { connectDatabase, getDb };