const express = require("express");
const path = require("path");
const os = require("os");
require("dotenv").config();

const { connectDatabase } = require("./src/config/database");

const authRoutes = require("./src/routes/auth.routes");
const clientesRoutes = require("./src/routes/clientes.routes");
const profileRoutes = require("./src/routes/profile.routes");

const app = express();
const PORT = 3000;

// Middlewares globais
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Rotas
app.use("/", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/profile", profileRoutes);

// Inicialização
async function start() {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
        const interfaces = os.networkInterfaces();
        let ipLocal = "localhost";

        for (let nome in interfaces) {
            for (const iface of interfaces[nome]) {
                if (iface.family === "IPv4" && !iface.internal) {
                    ipLocal = iface.address;
                }
            }
        }

        console.log("🚀 SERVIDOR RODANDO");
        console.log("No PC: http://localhost:" + PORT);
        console.log("No Celular: http://" + ipLocal + ":" + PORT);
    });
}

start();