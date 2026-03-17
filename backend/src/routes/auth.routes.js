const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rotas de entrada (NÃO precisam de middleware de segurança)
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
