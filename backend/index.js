const express = require("express");
const path = require("path");
const os = require("os");
require("dotenv").config();

const cors = require("cors");
const helmet = require("helmet");
const passport = require("passport");

// 🔥 inicializa strategy
require("./src/config/passportgoogle/googlestrategy");

const { connectDatabase } = require("./src/config/database");

const authRoutes = require("./src/routes/auth.routes");
const clientesRoutes = require("./src/routes/clientes.routes");
const profileRoutes = require("./src/routes/profile.routes");
const agendamentoRoutes = require("./src/routes/agendamento.routes");
const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 middlewares essenciais
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors({
  origin: "*", // depois você restringe
}));

app.use(express.json());
app.use(passport.initialize());

// 📁 frontend
app.use(express.static(path.join(__dirname, "..", "frontend")));

// 📌 rotas
app.use("/agendamentos", agendamentoRoutes);
app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/profile", profileRoutes);

// 🚀 start
async function start() {
  try {
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
      console.log("Local:", `http://localhost:${PORT}`);
      console.log("Rede:", `http://${ipLocal}:${PORT}`);
    });

  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
  }
}

start();