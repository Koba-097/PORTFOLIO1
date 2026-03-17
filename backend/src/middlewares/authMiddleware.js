const jwt = require("jsonwebtoken");

// Verifique se o seu .env tem o JWT_SECRET ou use a string "segredo" se estiver sem .env
const SECRET = process.env.JWT_SECRET || "segredo";

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // LOG 1: Ver se o token chegou no servidor
    console.log("--- Verificando Token ---");
    console.log("Header recebido:", authHeader);

    if (!authHeader)
        return res.status(401).json({ error: "Sem token" });

    if (!authHeader.startsWith("Bearer "))
        return res.status(401).json({ error: "Token mal formatado" });

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET);

        // LOG 2: Ver se o JWT conseguiu ler o ID
        console.log("✅ Token Válido! ID do Usuário:", decoded.id);

        req.userId = decoded.id;
        next();
    } catch (err) {
        // LOG 3: Ver por que o JWT recusou o token
        console.log("❌ Erro na validação:", err.message);
        return res.status(401).json({ error: "Token inválido" });
    }
}

module.exports = authMiddleware;