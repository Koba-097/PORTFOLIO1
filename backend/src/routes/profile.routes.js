const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, (req, res) => {
    res.json({
        message: "Rota profile funcionando",
        userId: req.userId
    });
});

module.exports = router;