const express = require("express");
const router = express.Router();
const agendamentoController = require("../controllers/agendamento.controller");

// rota
router.post("/", agendamentoController.criar);

module.exports = router;