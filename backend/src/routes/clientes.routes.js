const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const clienteController = require("../controllers/clienteController");

router.use(authMiddleware);

router.post("/", clienteController.create);
router.get("/", clienteController.listar);
router.delete("/:id", clienteController.deletar);

module.exports = router;